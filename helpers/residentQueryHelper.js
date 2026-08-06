// helpers/residentQueryHelper.js
// Utility functions used by both web and API resident list endpoints.

/**
 * Escape RegExp special characters in a user-provided search string.
 * Prevents malformed regexes and unintended pattern matching.
 */
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Build a MongoDB query filter for Resident list based on request params.
 * Always includes society scoping.
 */
function buildResidentFilter(req) {
  const { search = '', category, status } = req.query;
  const filter = { societyName: req.user.societyName };

  // Search handling – trimmed, escaped, case‑insensitive partial match.
  const trimmed = search.trim();
  if (trimmed) {
    const esc = escapeRegex(trimmed);
    const regex = new RegExp(esc, 'i');
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { $expr: { $regexMatch: { input: { $concat: ['$firstName', ' ', '$lastName'] }, regex: regex } } },
      { phone: regex },
      { unitNumber: regex },
      { email: regex },
    ];
  }

  if (category) {
    filter.category = category;
  }

  // Status filter is only exposed via API; we still honour it if present.
  if (status) {
    filter.status = status;
  }

  return filter;
}

/**
 * Parse pagination query params with robust defaults and clamping.
 */
function getPaginationParams(req) {
  const DEFAULT_PAGE = 1;
  const DEFAULT_SIZE = 20;
  const MAX_SIZE = 100;

  let page = parseInt(req.query.page, 10);
  let pageSize = parseInt(req.query.pageSize, 10);

  if (isNaN(page) || page < 1) page = DEFAULT_PAGE;
  if (isNaN(pageSize) || pageSize < 1) pageSize = DEFAULT_SIZE;
  if (pageSize > MAX_SIZE) pageSize = MAX_SIZE;

  const limit = pageSize;
  const skip = (page - 1) * limit;

  return { page, pageSize, limit, skip };
}

/**
 * Shared function to fetch residents with filter, pagination, and sorting.
 * Returns { residents, paginationMeta }.
 */
async function fetchResidents(req, ResidentModel) {
  const filter = buildResidentFilter(req);
  const { page, pageSize, limit, skip } = getPaginationParams(req);

  // Sorting: status (Active first), then name, then createdAt tie‑breaker.
  const sortSpec = { status: 1, lastName: 1, firstName: 1, createdAt: -1 };

  const [total, residents] = await Promise.all([
    ResidentModel.countDocuments(filter),
    ResidentModel.find(filter)
      .sort(sortSpec)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const totalPages = Math.ceil(total / pageSize) || 1;
  const paginationMeta = {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return { residents, paginationMeta };
}

module.exports = {
  escapeRegex,
  buildResidentFilter,
  getPaginationParams,
  fetchResidents,
};
