const Candidate = require('../models/candidateModel');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

const populateCandidate = (query) =>
  query.populate('position', 'title department').populate({
    path: 'position',
    populate: { path: 'department', select: 'name' },
  });

// @desc    Create candidate
// @route   POST /api/v1/candidates
const createCandidate = async (req, res, next) => {
  try {
    const { name, email, phone, position, resume } = req.body;

    if (!name || !email) {
      const error = new Error('Name and email are required');
      error.statusCode = 400;
      return next(error);
    }

    const candidate = await Candidate.create({ name, email, phone, position: position || null, resume });
    await populateCandidate(
      Candidate.findById(candidate._id)
    ).then((c) => candidate.set(c));

    const populated = await populateCandidate(Candidate.findById(candidate._id)).lean();

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all candidates
// @route   GET /api/v1/candidates
const getCandidates = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const candidates = await populateCandidate(
      Candidate.find(filter).sort({ createdAt: -1 })
    ).lean();

    res.status(200).json({
      success: true,
      message: 'Candidates retrieved successfully',
      data: candidates,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update candidate status
// @route   PUT /api/v1/candidates/:id/status
const updateCandidateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['applied', 'interviewing', 'accepted', 'rejected'];

    if (!status || !validStatuses.includes(status)) {
      const error = new Error(`Status must be one of: ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      return next(error);
    }

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      const error = new Error('Candidate not found');
      error.statusCode = 404;
      return next(error);
    }

    if (candidate.hired) {
      const error = new Error('Cannot update status of a hired candidate');
      error.statusCode = 409;
      return next(error);
    }

    candidate.status = status;
    await candidate.save();

    const populated = await populateCandidate(Candidate.findById(candidate._id)).lean();

    res.status(200).json({
      success: true,
      message: 'Candidate status updated',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Hire candidate → create employee account
// @route   POST /api/v1/candidates/:id/hire
const hireCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('position', 'title department');

    if (!candidate) {
      const error = new Error('Candidate not found');
      error.statusCode = 404;
      return next(error);
    }

    if (candidate.status !== 'accepted') {
      const error = new Error('Only accepted candidates can be hired');
      error.statusCode = 409;
      return next(error);
    }

    if (candidate.hired) {
      const error = new Error('Candidate has already been hired');
      error.statusCode = 409;
      return next(error);
    }

    const existingUser = await User.findOne({ email: candidate.email });
    if (existingUser) {
      const error = new Error('A user with this email already exists');
      error.statusCode = 409;
      return next(error);
    }

    // Generate a temporary password (email prefix + random 4-digit code)
    const tempPassword = `${candidate.email.split('@')[0]}${Math.floor(1000 + Math.random() * 9000)}`;

    const user = await User.create({
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone || '',
      password: tempPassword,
      role: 'employee',
      position: candidate.position?._id || null,
      department: candidate.position?.department || null,
    });

    // Mark candidate as hired
    candidate.hired = true;
    candidate.status = 'accepted';
    await candidate.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: `${candidate.name} has been hired successfully`,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          position: user.position,
          department: user.department,
        },
        tempPassword,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createCandidate, getCandidates, updateCandidateStatus, hireCandidate };
