function showHome(req, res) {
  res.render('index', { session: req.session });
}

module.exports = { showHome };
