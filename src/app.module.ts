import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { JobModule } from './job/job.module';
import { JopController } from './jop/jop.controller';
import { JopService } from './jop/jop.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthModule, UserModule, JobModule, PrismaModule],
  controllers: [AppController, JopController],
  providers: [AppService, JopService],
})
export class AppModule {}
