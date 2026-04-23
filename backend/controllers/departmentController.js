const Department = require('../models/departmentModel');

// @desc    Create department
// @route   POST /api/v1/departments
const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      const error = new Error('Department name is required');
      error.statusCode = 400;
      return next(error);
    }

    const exists = await Department.findOne({ name: name.trim() });
    if (exists) {
      const error = new Error('A department with this name already exists');
      error.statusCode = 409;
      return next(error);
    }

    const department = await Department.create({ name, description });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all departments
// @route   GET /api/v1/departments
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 }).lean();

    res.status(200).json({
      success: true,
      message: 'Departments retrieved successfully',
      data: departments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update department
// @route   PUT /api/v1/departments/:id
const updateDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      const error = new Error('Department not found');
      error.statusCode = 404;
      return next(error);
    }

    if (name !== undefined) department.name = name;
    if (description !== undefined) department.description = description;

    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete department
// @route   DELETE /api/v1/departments/:id
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      const error = new Error('Department not found');
      error.statusCode = 404;
      return next(error);
    }

    await department.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createDepartment, getDepartments, updateDepartment, deleteDepartment };
