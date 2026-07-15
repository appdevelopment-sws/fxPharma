import { rootPrisma } from "@/lib/prisma.js";
import { CreditRequestStatus, CreditLogType, Prisma } from "@prisma/client";

export class CreditService {
  async deductCredit(
    organizationId: string,
    amount: number,
    reason: string,
    branchId?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prismaClient = tx || rootPrisma;
    const org = await prismaClient.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org) {
      throw new Error("Organization not found");
    }

    if (org.creditBalance < amount) {
      throw new Error("Insufficient credit balance");
    }

    const updatedOrg = await prismaClient.organization.update({
      where: { id: organizationId },
      data: { creditBalance: { decrement: amount } },
    });

    await prismaClient.creditLog.create({
      data: {
        organizationId,
        amount,
        type: CreditLogType.DEBIT,
        reason,
        branchId,
      },
    });

    return updatedOrg;
  }

  async addCredit(
    organizationId: string,
    amount: number,
    reason: string,
    branchId?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prismaClient = tx || rootPrisma;

    const updatedOrg = await prismaClient.organization.update({
      where: { id: organizationId },
      data: { creditBalance: { increment: amount } },
    });

    await prismaClient.creditLog.create({
      data: {
        organizationId,
        amount,
        type: CreditLogType.CREDIT,
        reason,
        branchId,
      },
    });

    return updatedOrg;
  }

  async createCreditRequest(
    organizationId: string,
    requestedLimit: number,
    paymentScreenshotUrl: string,
  ) {
    return rootPrisma.creditRequest.create({
      data: {
        organizationId,
        requestedLimit,
        paymentScreenshotUrl,
        status: CreditRequestStatus.PENDING,
      },
    });
  }

  async approveCreditRequest(requestId: string, adminToken: string) {
    return rootPrisma.$transaction(async (tx) => {
      const request = await tx.creditRequest.findUnique({
        where: { id: requestId },
      });

      if (!request) {
        throw new Error("Credit request not found");
      }

      if (request.status !== CreditRequestStatus.PENDING) {
        throw new Error("Request is not pending");
      }

      const updatedRequest = await tx.creditRequest.update({
        where: { id: requestId },
        data: {
          status: CreditRequestStatus.APPROVED,
          adminToken,
        },
      });

      await this.addCredit(
        request.organizationId,
        request.requestedLimit,
        `Credit Request Approved: ${requestId}`,
        undefined,
        tx,
      );

      return updatedRequest;
    });
  }

  async rejectCreditRequest(requestId: string) {
    return rootPrisma.creditRequest.update({
      where: { id: requestId },
      data: {
        status: CreditRequestStatus.REJECTED,
      },
    });
  }

  async getCreditRequests(organizationId?: string) {
    const where = organizationId ? { organizationId } : {};
    return rootPrisma.creditRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { organization: true },
    });
  }

  async getCreditLogs(organizationId: string) {
    return rootPrisma.creditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: { branch: true },
    });
  }
}

export const creditService = new CreditService();
