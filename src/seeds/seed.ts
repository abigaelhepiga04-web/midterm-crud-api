import 'reflect-metadata';
import bcrypt from 'bcrypt';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Task } from '../entities/Task';
import { Category } from '../entities/Category';

const seedDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('🌱 Connected to database for seeding...');

    const userRepository = AppDataSource.getRepository(User);
    const taskRepository = AppDataSource.getRepository(Task);
    const categoryRepository = AppDataSource.getRepository(Category);

    // Create Categories
    const categories = await categoryRepository.save([
      { name: 'Work' },
      { name: 'Personal' },
      { name: 'Urgent' }
    ]);

    // Create 5 Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const users = [];

    for (let i = 1; i <= 5; i++) {
      const user = userRepository.create({
        name: `User ${i}`,
        email: `user${i}@example.com`,
        password: hashedPassword,
        phoneNumber: `+1555000000${i}`
      });
      users.push(await userRepository.save(user));
    }

    // Create 15 Tasks
    const statuses: ('pending' | 'in-progress' | 'completed')[] = ['pending', 'in-progress', 'completed'];
    const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];

    for (let i = 1; i <= 15; i++) {
      const userIndex = (i - 1) % users.length;
      const categoryIndex = (i - 1) % categories.length;

      const task = taskRepository.create({
        title: `Seeded Task ${i}`,
        description: `Description for task ${i}`,
        status: statuses[i % 3],
        priority: priorities[i % 3],
        userId: users[userIndex].id,
        categoryId: categories[categoryIndex].id,
        isDeleted: false
      });
      await taskRepository.save(task);
    }

    console.log('✅ Seeding completed: Created 3 categories, 5 users, and 15 tasks!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();