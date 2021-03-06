// Set up the Elasticsearch client and endpoints for querying elasticsearch.
// The frontend will call these endpoints, sending the necessary parameters
// in the request body. The endpoints return the data from elasticsearch that
// has been clean by the helper functions in cleanES.js. The elasticsearch
// queries themselves can be found in queries.js.

require('dotenv').config();
const app = require('../../server.js');
const elasticsearch = require('elasticsearch');
const queries = require('./queries.js');
const clean = require('./cleanES.js');

const client = new elasticsearch.Client({
  host: process.env.ELASTICSEARCH_HOST,
});
const index = 'twitter';
const type = 'tweet';

app.post('/api/KeywordAcrossGender', (req, res) => {
  const keyword = req.body.keyword ? req.body.keyword.toLowerCase().replace(' ', '*') : '*';
  const recipientsGender = req.body.recipientsGender === undefined ?
    false : clean.cleanGender(req.body.recipientsGender);
  const sentiment = req.body.sentiment || false;
  const senderFollowerMin = req.body.senderFollowerMin || false;
  const senderFollowerMax = req.body.senderFollowerMax || false;
  let esBody = queries.KeywordAcrossGenderBody();

  esBody = queries.applyFilters(esBody, false, recipientsGender,
    sentiment, senderFollowerMin, senderFollowerMax);

  esBody = queries.addKeywordtoAdjacencyMatrix(esBody, keyword);

  client.search({
    index,
    type,
    size: 0,
    from: 0,
    body: esBody,
  }).then(body => clean.cleanAdjacencyMatrix(body.aggregations.interactions.buckets, 'femaleSender', 'maleSender'))
    .then(data => res.send(data));
});

app.post('/api/KeywordAcrossFollowerCount', (req, res) => {
  const keyword = req.body.keyword ? req.body.keyword.toLowerCase().replace(' ', '*') : '*';
  const senderGender = req.body.senderGender === undefined ?
    false : clean.cleanGender(req.body.senderGender);
  const recipientsGender = req.body.recipientsGender === undefined ?
    false : clean.cleanGender(req.body.recipientsGender);
  const sentiment = req.body.sentiment || false;
  let esBody = queries.KeywordAcrossFollowerCountBody();

  esBody = queries.applyFilters(esBody, senderGender, recipientsGender,
    sentiment);

  esBody = queries.addKeywordtoAdjacencyMatrix(esBody, keyword);

  client.search({
    index,
    type,
    size: 0,
    from: 0,
    body: esBody,
  }).then(body => clean.cleanAdjacencyMatrix(body.aggregations.interactions.buckets, 'over500followers', 'under500followers'))
    .then(data => res.send(data));
});

app.post('/api/KeywordAcrossSentiment', (req, res) => {
  const keyword = req.body.keyword ? req.body.keyword.toLowerCase().replace(' ', '*') : '*';
  const senderGender = req.body.senderGender === undefined ?
    false : clean.cleanGender(req.body.senderGender);
  const recipientsGender = req.body.recipientsGender === undefined ?
    false : clean.cleanGender(req.body.recipientsGender);
  const senderFollowerMin = req.body.senderFollowerMin || false;
  const senderFollowerMax = req.body.senderFollowerMax || false;
  let esBody = queries.KeywordAcrossSentimentBody();

  esBody = queries.applyFilters(esBody, senderGender, recipientsGender,
    false, senderFollowerMin, senderFollowerMax);

  esBody = queries.addKeywordtoAdjacencyMatrix(esBody, keyword);

  client.search({
    index,
    type,
    size: 0,
    from: 0,
    body: esBody,
  }).then(body => clean.cleanAdjacencyMatrix(body.aggregations.interactions.buckets, 'positiveSentiment', 'negativeSentiment'))
    .then(data => res.send(data));
});

app.post('/api/SelectionsOverTime', (req, res) => {
  const keyword = req.body.keyword ? req.body.keyword.toLowerCase().replace(' ', '*') : '*';
  const senderGender = req.body.senderGender === undefined ?
    false : clean.cleanGender(req.body.senderGender);
  const recipientsGender = req.body.recipientsGender === undefined ?
    false : clean.cleanGender(req.body.recipientsGender);
  const sentiment = req.body.sentiment || false;
  const senderFollowerMin = req.body.senderFollowerMin || false;
  const senderFollowerMax = req.body.senderFollowerMax || false;
  let esBody = queries.SelectionsOverTimeBody();

  esBody = queries.applyFilters(esBody, senderGender, recipientsGender,
    sentiment, senderFollowerMin, senderFollowerMax);

  esBody = queries.addKeywordToMusts(esBody, keyword);

  client.search({
    index,
    type,
    size: 0,
    from: 0,
    body: esBody,
  }).then(body => body.aggregations.histogram.buckets)
    .then(data => res.send(data));
});

app.post('/api/BucketedBarChart', (req, res) => {
  const keyword = req.body.keyword ? req.body.keyword.toLowerCase().replace(' ', '*') : '*';
  const senderGender = false;
  const recipientsGender = req.body.recipientsGender === undefined ?
    false : clean.cleanGender(req.body.recipientsGender);
  const sentiment = req.body.sentiment || false;
  const senderFollowerMin = req.body.senderFollowerMin || false;
  const senderFollowerMax = req.body.senderFollowerMax || false;
  let esBody = queries.BucketedBarChartBody();

  esBody = queries.applyFilters(esBody, senderGender, recipientsGender,
    sentiment, senderFollowerMin, senderFollowerMax);

  esBody = queries.addKeywordToMusts(esBody, keyword);

  client.search({
    index,
    type,
    size: 0,
    from: 0,
    body: esBody,
  }).then(body => clean.cleanBucketedBarChart(body.aggregations.followerCount_ranges))
    .then(data => res.send(data));
});

app.post('/api/BucketedBarChartBodySentiment', (req, res) => {
  const keyword = req.body.keyword ? req.body.keyword.toLowerCase().replace(' ', '*') : '*';
  const senderGender = req.body.senderGender === undefined ?
    false : clean.cleanGender(req.body.senderGender);
  const recipientsGender = req.body.recipientsGender === undefined ?
    false : clean.cleanGender(req.body.recipientsGender);
  const sentiment = false;
  const senderFollowerMin = req.body.senderFollowerMin || false;
  const senderFollowerMax = req.body.senderFollowerMax || false;
  let esBody = queries.BucketedBarChartSentimentBody();

  esBody = queries.applyFilters(esBody, senderGender, recipientsGender,
    sentiment, senderFollowerMin, senderFollowerMax);

  esBody = queries.addKeywordToMusts(esBody, keyword);
  client.search({
    index,
    type,
    size: 0,
    from: 0,
    body: esBody,
  }).then(body => clean.cleanBucketedBarChartSentiment(body.aggregations.followerCount_ranges))
    .then(data => res.send(data));
});
