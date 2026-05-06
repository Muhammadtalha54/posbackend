/**
 * ============================================
 * Zod Validation Middleware Factory
 * ============================================
 * 
 * Creates Express middleware that validates
 * request data (body, query, params) against
 * a Zod schema. Returns 400 with detailed
 * error messages on validation failure.
 * 
 * Usage:
 *   const { z } = require('zod');
 *   const schema = z.object({ name: z.string() });
 *   router.post('/', validate(schema), handler);
 *   router.get('/', validate(querySchema, 'query'), handler);
 * ============================================
 */

const { sendError } = require('../utils/response');

/**
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Where to read data from (default: 'body')
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      // Extract human-readable error messages from Zod
      const errors = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      return sendError(res, 'Validation failed.', 400, errors);
    }

    // Replace raw data with parsed/transformed data from Zod
    req[source] = result.data;
    next();
  };
}

module.exports = validate;
