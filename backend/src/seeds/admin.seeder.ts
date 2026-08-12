import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export class AdminSeeder implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const repository = dataSource.getRepository(User);

        const adminEmail = 'admin@gmail.com';

        const adminExists = await repository.findOneBy({ email: adminEmail });

        if (!adminExists) {
        
            const hashedPassword = await bcrypt.hash('121212', 10);

            const admin = repository.create({
                email: adminEmail,
                username: 'admin',
                password: hashedPassword,
                role: UserRole.ADMIN,
                isActive: true,
            });

            await repository.save(admin);

        }
    }
}
