const Product = require('../models/product');

exports.getAllProductsStatic = async (req, res) => {
  // const products = await Product.find({}).sort('-name price');
  const products = await Product.find({})
    .sort('name')
    .select('name price')
    .limit(10)
    .skip(5);
  res.status(200).json({ nbHits: products.length, products });
};

exports.getAllProducts = async (req, res) => {
  // No longer required with Mongoose v6
  // https://mongoosejs.com/docs/migrating_to_6.html#strictquery-is-removed-and-replaced-by-strict
  // const { featured } = req.query;
  // const queryObject = {};

  // if (featured) queryObject.featured = featured === 'true' ? true : false;
  // console.log(queryObject);
  // const products = await Product.find(queryObject);

  if (req.query.name)
    req.query.name = { $regex: req.query.name, $options: 'i' };

  if (req.query.numericFilters) {
    const operatorMap = {
      '>': '$gt',
      '>=': '$gte',
      '=': '$eq',
      '<': '$lt',
      '<=': '$lte',
    };
    const regEx = /\b(>|>=|=|<|<=)\b/g;

    let filters = req.query.numericFilters.replace(
      regEx,
      match => `-${operatorMap[match]}-`
    );

    const options = ['price', 'rating'];
    filters = filters.split(',').forEach(item => {
      const [field, operator, value] = item.split('-');
      if (options.includes(field)) {
        req.query[field] = { [operator]: Number(value) };
        delete req.query.numericFilters;
      }
    });
  }

  console.log(req.query);

  let result = Product.find(req.query);
  // Sort
  if (req.query.sort) {
    const sortList = req.query.sort.split(',').join(' ');
    result = result.sort(sortList);
  } else {
    result = result.sort('createdAt');
  }
  // Fields
  if (req.query.fields) {
    const fieldsList = req.query.fields.split(',').join(' ');
    result = result.select(fieldsList);
  }
  // Pagination / Limit
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);
  // 23 items in the DB
  // If we want 4 pages = 7 + 7 + 7 + 2
  // If 0 page, skip will be 0 and the limit will be 10 (so first 10 results)
  // If 1 page, skip will be 10, therefore it skips the first 10 (page 1) and shows the next 10 (page 2)

  const products = await result;
  res.status(200).json({ nbHits: products.length, products });
};
