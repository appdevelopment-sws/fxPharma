import { Response } from "express";

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

/**
 * Extracts and calculates pagination options from query parameters.
 * @param query - The request query object (req.query)
 * @param defaultLimit - Default number of items per page (default: 10)
 */
export const getPaginationOptions = (query: any, defaultLimit = 10): PaginationOptions => {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit as string) || defaultLimit));
  const skip = (page - 1) * limit;
  const take = limit;

  return { page, limit, skip, take };
};

/**
 * Formats a paginated response with metadata.
 * @param data - The array of items for the current page
 * @param total - Total count of items across all pages
 * @param options - The pagination options used for the query
 */
export const formatPaginatedResponse = <T>(
  data: T[],
  total: number,
  options: PaginationOptions
) => {
  const { page, limit } = options;
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Handles the standard pagination and search flow in a controller.
 * @param res - Express response object
 * @param query - Request query object
 * @param fetchFn - Function to fetch data and total count (receives skip, take, and search)
 */
export const paginate = async <T>(
  res: Response,
  query: any,
  fetchFn: (skip: number, take: number, search?: string) => Promise<{ data: T[]; total: number }>
) => {
  const options = getPaginationOptions(query);
  const search = query.search as string;
  const { data, total } = await fetchFn(options.skip, options.take, search);
  return res.json(formatPaginatedResponse(data, total, options));
};
