'use strict';

const _ = require('lodash');

const mw = {
  formatQuery: require('warepot/format-query'),
  paginate: require('warepot/paginate')
};

const ErrorModel = require('mongopot/models/error');

function find(req, res, next) {
  const page = Math.max(0, req.query.page) || 0;
  const perPage = Math.max(0, req.query.limit) || res.locals.perPage;

  const query = ErrorModel.find(_.omit(req.query, 'limit', 'sort', 'page'),
    null,
    { sort: req.query.sort || '-dateCreated', lean: true });

  if (perPage)
    query.limit(perPage).skip(perPage * page);

  query.exec(function (err, errors) {
    res.locals.errors = errors;
    next(err);
  });
}

function findById(req, res, next) {
  ErrorModel.findById(req.params.id, function (err, page) {
    if (err) return next(err);
    if (page) res.locals.page = page;
    next();
  });
}

function getAll(req, res, next) {
  ErrorModel.find({}).sort('-dateCreated').exec(function (err, errors) {
    if (err) return next(err);

    res.status(200);

    res.locals.errors = errors;

    next();
  });
}

function remove(req, res, next) {
  ErrorModel.remove({ _id: req.params.id }, function (err) {
    if (err) return next(err);

    res.status(204).locals.ok = true;

    next();
  });
}

function removeQuery(req, res, next) {
  ErrorModel.remove(_.omit(req.query, 'limit', 'sort', 'page'), function (err) {
    if (err) return next(err);

    res.status(204).locals.ok = true;

    next();
  });
}

module.exports = {
  find,
  findById,
  formatQuery: mw.formatQuery([ 'sort', 'limit', 'page', 'status' ]),
  getAll,
  paginate: mw.paginate(ErrorModel, 200),
  remove,
  removeQuery
};