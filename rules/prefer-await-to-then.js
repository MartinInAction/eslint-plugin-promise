/**
 * Rule: prefer-await-to-then
 * Discourage using then()/catch()/finally() and instead use async/await.
 */

'use strict'

const getDocsUrl = require('./lib/get-docs-url')

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `await` to `then()`/`catch()`/`finally()` for reading Promise values.',
      url: getDocsUrl('prefer-await-to-then'),
    },
    schema: [],
  },
  create(context) {
    /** Returns true if node is inside yield or await expression. */
    function isInsideYieldOrAwait(node) {
      const { sourceCode } = context;
      return sourceCode.getAncestors(node).some((parent) => {
        return (
          parent.type === 'AwaitExpression' || parent.type === 'YieldExpression'
        )
      })
    }

    /**
     * Returns true if node is created at the top-level scope.
     * Await statements are not allowed at the top level,
     * only within function declarations.
     */
    function isTopLevelScoped() {
      return context.sourceCode.getScope(node).block.type === 'Program'
    }

    return {
      'CallExpression > MemberExpression.callee'(node) {
        if (isTopLevelScoped() || isInsideYieldOrAwait()) {
          return
        }

        // if you're a then/catch/finally expression then you're probably a promise
        if (
          node.property &&
          (node.property.name === 'then' ||
            node.property.name === 'catch' ||
            node.property.name === 'finally')
        ) {
          context.report({
            node: node.property,
            message: 'Prefer await to then()/catch()/finally().',
          })
        }
      },
    }
  },
}
