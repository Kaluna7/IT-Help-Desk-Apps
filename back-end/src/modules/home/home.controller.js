export function getHome(req, res) {
  res.json({
    message: 'IT Report API is running',
    module: 'home',
    database: 'mongodb',
  });
}
