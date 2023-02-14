const { ApolloError } = require('apollo-server-express')
const Sentry = require('@sentry/node')

module.exports.requestDidStart = () => {
  /* Within this returned object, define functions that respond
           to request-specific lifecycle events. */
  return {
    didEncounterErrors(ctx) {
      // If we couldn't parse the operation, don't
      // do anything here
      if (!ctx.operation) {
        return
      }
      for (const err of ctx.errors) {
        // Only report internal server errors,
        // all errors extending ApolloError should be user-facing
        if (err.originalError instanceof ApolloError) {
          continue
        }
        // Add scoped report details and send to Sentry
        Sentry.withScope((scope) => {
          // Annotate whether failing operation was query/mutation/subscription
          scope.setTag('kind', ctx.operation.operation)
          // Log query and variables as extras
          // (make sure to strip out sensitive data!)
          scope.setExtra('query', ctx.request.query)
          scope.setExtra('variables', ctx.request.variables)
          if (err.path) {
            // We can also add the path as breadcrumb
            scope.addBreadcrumb({
              category: 'query-path',
              message: err.path.join(' > '),
              level: Sentry.Severity.Debug,
            })
          }
          Sentry.captureException(err)
        })
      }
    },
  }
}
