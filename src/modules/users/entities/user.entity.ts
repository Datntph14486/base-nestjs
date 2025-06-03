import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { GENDER, UserRole } from '../enums';
import { BaseEntity } from 'src/common/entities/base.entity';
import * as argon2d from 'argon2';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'email', unique: true, nullable: false })
  email: string;

  @Column({ name: 'user_name', unique: true, nullable: false })
  username: string;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ type: 'enum', enum: GENDER, name: 'gender', nullable: true })
  gender: string;

  @Column({ type: 'date', name: 'date_of_birth', nullable: true })
  dateOfBirth: Date;

  @Column({ name: 'password', nullable: false })
  password: string;

  @Column({ name: 'hashed_rt', nullable: true })
  hashedRT: string;

  @Column({ name: 'blocked', nullable: true })
  blocked: boolean;

  @Column({ name: 'phone', nullable: true })
  phone: string;

  @Column({ name: 'full_address', nullable: true })
  fullAddress: string;

  @Column({ name: 'department_code', nullable: true })
  departmentCode: string;

  @Column({ name: 'job_title', nullable: true })
  jobTitle: string;

  @Column({ name: 'avatar', nullable: true })
  avatar: string;

  @Column({ name: 'forgot_password_token', nullable: true })
  forgotPasswordToken: string;

  @Column({ name: 'forgot_password_expired_at', nullable: true })
  forgotPasswordExpiredAt: Date;

  @Column({
    type: 'enum',
    name: 'role',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await argon2d.hash(this.password);
    }
  }
}
