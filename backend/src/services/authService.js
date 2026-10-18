const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const userRepository = require('../repositories/userRepository');
const { generateToken } = require('../utils/tokenHelper');

class AuthService {
  async registerStudent({ name, email, phone, department, year, password }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const studentId = `stud-${uuidv4().substring(0, 6)}`;

    const newStudent = await userRepository.createStudent({
      studentId,
      name,
      email,
      phone,
      department,
      year,
      passwordHash
    });

    const token = generateToken({
      id: studentId,
      email,
      role: 'Student'
    });

    return {
      user: {
        id: studentId,
        name,
        email,
        department,
        year,
        role: 'Student'
      },
      token
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const id = user.adminId || user.studentId;
    const token = generateToken({
      id,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        points: user.points
      },
      token
    };
  }

  async getCurrentUser(id, role) {
    if (role === 'Student') {
      return userRepository.getStudentProfile(id);
    }
    const cypher = `MATCH (a:Admin {adminId: $id}) RETURN a.adminId AS id, a.name AS name, a.email AS email, 'Admin' AS role`;
    const { executeQuery } = require('../config/db');
    const { recordsToObjects } = require('../utils/neo4jUtils');
    const result = await executeQuery(cypher, { id });
    return recordsToObjects(result.records)[0];
  }
}

module.exports = new AuthService();
