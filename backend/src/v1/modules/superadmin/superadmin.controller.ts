import { Request, Response } from "express";
import { rootPrisma } from "@/lib/prisma.js";
import { catchAsync } from "../../../utils/catchAsync.js";

export const SuperAdminController = {
  /**
   * Get comprehensive super admin dashboard stats & analytics
   */
  getDashboardStats: catchAsync(async (req: Request, res: Response) => {
    // 1. KPI Counts
    const [
      totalShops,
      activeShops,
      inactiveShops,
      totalUsers,
      totalInvoices,
      revenueAggregate,
      totalPlans,
      planSubscriptions,
    ] = await Promise.all([
      rootPrisma.organization.count(),
      rootPrisma.organization.count({ where: { isActive: true } }),
      rootPrisma.organization.count({ where: { isActive: false } }),
      rootPrisma.user.count(),
      rootPrisma.invoice.count(),
      rootPrisma.invoice.aggregate({ _sum: { totalAmount: true } }),
      rootPrisma.plan.count(),
      rootPrisma.organization.groupBy({
        by: ["planId"],
        _count: { id: true },
      }),
    ]);

    // Fetch plan details for subscriber mapping
    const plans = await rootPrisma.plan.findMany({
      select: { id: true, name: true },
    });
    const planNameMap = new Map(plans.map((p) => [p.id, p.name]));

    const planDistribution = planSubscriptions.map((item) => ({
      planId: item.planId,
      planName: item.planId ? planNameMap.get(item.planId) || "Custom Plan" : "No Plan",
      count: item._count.id,
    }));

    // 2. Recent Organizations with activity metrics
    const recentOrgsRaw = await rootPrisma.organization.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        plan: { select: { name: true } },
        _count: {
          select: {
            branches: true,
            members: true,
            invoices: true,
            inventory: true,
            auditLogs: true,
          },
        },
        auditLogs: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        },
      },
    });

    const recentOrganizations = recentOrgsRaw.map((org) => {
      const lastAudit = org.auditLogs[0]?.createdAt;
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        ownerEmail: org.ownerEmail || "N/A",
        isActive: org.isActive,
        planName: org.plan?.name || "Free Tier",
        createdAt: org.createdAt,
        lastActive: lastAudit || org.updatedAt,
        branchCount: org._count.branches,
        memberCount: org._count.members,
        invoiceCount: org._count.invoices,
        inventoryCount: org._count.inventory,
        totalActions: org._count.auditLogs,
      };
    });

    // 3. Most Active Organizations Leaderboard
    const activeOrgsRaw = await rootPrisma.organization.findMany({
      take: 8,
      orderBy: [
        { auditLogs: { _count: "desc" } },
        { invoices: { _count: "desc" } },
      ],
      include: {
        plan: { select: { name: true } },
        _count: {
          select: {
            auditLogs: true,
            invoices: true,
            inventory: true,
            members: true,
          },
        },
        auditLogs: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        },
      },
    });

    const organizationLeaderboard = activeOrgsRaw.map((org, index) => ({
      rank: index + 1,
      id: org.id,
      name: org.name,
      slug: org.slug,
      ownerEmail: org.ownerEmail || "N/A",
      planName: org.plan?.name || "Free Tier",
      isActive: org.isActive,
      activityScore:
        org._count.auditLogs + org._count.invoices * 2 + org._count.inventory,
      auditLogCount: org._count.auditLogs,
      invoiceCount: org._count.invoices,
      inventoryCount: org._count.inventory,
      memberCount: org._count.members,
      lastActive: org.auditLogs[0]?.createdAt || org.updatedAt,
    }));

    // 4. Feature Usage Breakdown (Group by Entity in Audit Logs + Database Table Counts)
    const auditFeatureGroup = await rootPrisma.auditLog.groupBy({
      by: ["entity"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    // Fallback/Augment with direct table counts if audit logs are fresh
    const invoiceCount = await rootPrisma.invoice.count();
    const inventoryCount = await rootPrisma.inventory.count();
    const orderCount = await rootPrisma.order.count();
    const creditCount = await rootPrisma.creditRequest.count();
    const supplierCount = await rootPrisma.supplier.count();

    const featureUsage = [
      {
        feature: "Billing & Invoices",
        entity: "INVOICE",
        usageCount: Math.max(
          invoiceCount,
          auditFeatureGroup.find((f) => f.entity === "INVOICE")?._count.id || 0
        ),
      },
      {
        feature: "Inventory & Medicines",
        entity: "INVENTORY",
        usageCount: Math.max(
          inventoryCount,
          auditFeatureGroup.find((f) => f.entity === "INVENTORY")?._count.id || 0
        ),
      },
      {
        feature: "Purchase Orders",
        entity: "ORDER",
        usageCount: Math.max(
          orderCount,
          auditFeatureGroup.find((f) => f.entity === "ORDER")?._count.id || 0
        ),
      },
      {
        feature: "Credit Requests",
        entity: "CREDIT",
        usageCount: Math.max(
          creditCount,
          auditFeatureGroup.find((f) => f.entity === "CREDIT")?._count.id || 0
        ),
      },
      {
        feature: "Supplier Management",
        entity: "SUPPLIER",
        usageCount: Math.max(
          supplierCount,
          auditFeatureGroup.find((f) => f.entity === "SUPPLIER")?._count.id || 0
        ),
      },
      {
        feature: "User Management & Auth",
        entity: "USER",
        usageCount: auditFeatureGroup.find((f) => f.entity === "USER")?._count.id || 10,
      },
    ];

    // 5. Activity Trend over the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const auditLogsRecent = await rootPrisma.auditLog.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });

    // Group activity by day
    const dayMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split("T")[0];
      dayMap.set(dayStr, 0);
    }

    auditLogsRecent.forEach((log) => {
      const dayStr = log.createdAt.toISOString().split("T")[0];
      if (dayMap.has(dayStr)) {
        dayMap.set(dayStr, (dayMap.get(dayStr) || 0) + 1);
      }
    });

    const activityTrend = Array.from(dayMap.entries()).map(([date, value]) => ({
      date,
      formattedDate: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value,
    }));

    // 6. Recent Audit Logs Feed
    const recentAuditLogs = await rootPrisma.auditLog.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true, slug: true } },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalShops,
          activeShops,
          inactiveShops,
          totalUsers,
          totalInvoices,
          totalRevenue: revenueAggregate._sum.totalAmount || 0,
          totalPlans,
        },
        planDistribution,
        recentOrganizations,
        organizationLeaderboard,
        featureUsage,
        activityTrend,
        recentAuditLogs: recentAuditLogs.map((log) => ({
          id: log.id,
          action: log.action,
          entity: log.entity,
          entityId: log.entityId,
          userName: log.user?.name || log.user?.email || "System/User",
          userEmail: log.user?.email || null,
          organizationName: log.organization?.name || "Global Platform",
          organizationSlug: log.organization?.slug || null,
          ipAddress: log.ipAddress,
          createdAt: log.createdAt,
        })),
      },
    });
  }),

  /**
   * Get paginated audit logs for Super Admin inspection
   */
  getAuditLogs: catchAsync(async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || "20", 10)));
    const skip = (page - 1) * limit;

    const { search, organizationId, entity, action } = req.query;

    const where: any = {};

    if (organizationId && typeof organizationId === "string") {
      where.organizationId = organizationId;
    }

    if (entity && typeof entity === "string") {
      where.entity = entity;
    }

    if (action && typeof action === "string") {
      where.action = action;
    }

    if (search && typeof search === "string") {
      where.OR = [
        { entityId: { contains: search, mode: "insensitive" } },
        { entity: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { organization: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [logs, total] = await Promise.all([
      rootPrisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          organization: { select: { id: true, name: true, slug: true } },
          branch: { select: { id: true, name: true } },
        },
      }),
      rootPrisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }),
};
