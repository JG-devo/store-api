exports.getAllProductsStatic = async (req, res) => {
  res.status(200).json({ msg: 'products testing route' });
};

exports.getAllProducts = async (req, res) => {
  res.status(200).json({ msg: 'products route' });
};
