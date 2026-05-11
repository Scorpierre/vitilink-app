import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DocumentWorkerService implements OnModuleInit {
  private readonly logger = new Logger(DocumentWorkerService.name);
  private readonly intervalMs = 30_000;
  private isRunning = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.logger.log('Document worker started');

    setInterval(() => {
      this.checkPendingDocuments();
    }, this.intervalMs);
  }

  private async checkPendingDocuments() {
    if (this.isRunning) return;

    this.isRunning = true;

    try {
      const documents = await this.prisma.document.findMany({
        where: {
          status: 'PENDING',
        },
        include: {
          entreprise: true,
          user: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: 10,
      });

      if (documents.length === 0) {
        this.logger.log('No pending documents found');
        return;
      }

      this.logger.log(`Found ${documents.length} pending document(s)`);

      for (const document of documents) {
        this.logger.log(
            `Document ${document.id} | type=${document.type} | entreprise=${document.entreprise?.name ?? 'N/A'} | status=${document.status}`,
        );

        // TEST : auto approve
        await this.prisma.document.update({
            where: { id: document.id },
            data: {
            status: 'APPROVED',
            reviewedAt: new Date(),
            },
        });

        this.logger.log(`Document ${document.id} APPROVED`);
        }
    } catch (error) {
      this.logger.error('Worker failed while checking documents', error);
    } finally {
      this.isRunning = false;
    }
  }
}