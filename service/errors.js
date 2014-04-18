/**
 * Created by Nick on 14-4-17.
 */
exports.caseError = function (req, res, next) {
  return res.status(403).send('<h2>403 Forbidden</h2><h4>Load Case Error</h4>Please refresh the case page and copy the case url into the player again.');
}