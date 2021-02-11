const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  var id1
  var id2
  test('Every field filled in', function(done) {
    chai.request(server)
    .post('/api/issues/apitest')
    .send({
      issue_title: 'Test',
      issue_text: 'this is a test',
      created_by: 'TheTestFile',
      assigned_to: 'test assignment filled out',
      status_text: 'optional status text'
    })
    .end((err, res) => {
      assert.equal(res.status, 200)
      assert.equal(res.body.open, true)
      assert.notEqual(res.body.id, '')
      assert.equal(res.body.issue_title, 'Test')
      assert.equal(res.body.issue_text, 'this is a test')
      assert.equal(res.body.created_by, 'TheTestFile')
      assert.equal(res.body.assigned_to, 'test assignment filled out')
      assert.equal(res.body.status_text, 'optional status text')
      assert.notEqual(res.body.created_on, '')
      assert.notEqual(res.body.updated_on, '')
      id1 = res.body._id
      done();
    })
  })

  test('Only required fields filled in', function(done) {
    chai.request(server)
    .post('/api/issues/apitest')
    .send({
      issue_title: 'Only required',
      issue_text: 'this text is also required',
      created_by: 'TheTestFile'
    })
    .end((err, res) => {
      assert.equal(res.status, 200)
      assert.equal(res.body.issue_title, 'Only required')
      assert.equal(res.body.issue_text, 'this text is also required')
      assert.equal(res.body.created_by, 'TheTestFile')
      assert.equal(res.body.assigned_to, '')
      assert.equal(res.body.status_text, '')
      id2 = res.body._id
      done();
    })
  })

  test('Required fields not filled in', function(done) {
    chai.request(server)
    .post('/api/issues/apitest')
    .send({})
    .end((err, res) => {
      assert.equal(res.status, 200)
      assert.equal(res.text, '{"error":"required field(s) missing"}')
      done();
    })
  })

  test('View issues on a project', function(done) {
    chai.request(server)
      .get('/api/issues/apitest')
      .end((err, res) => {
        let length = res.body.length
        let randomIndex = Math.floor(Math.random() * length)
        assert.equal(res.status, 200)
        assert.equal(res.body[randomIndex].project, 'apitest')
        done();
      })
  })

  test('View issues on a project with one filter', function(done) {
    chai.request(server)
      .get('/api/issues/apitest?created_by=TheTestFile')
      .end((err, res) => {
        let length = res.body.length
        let randomIndex = Math.floor(Math.random() * length)
        assert.equal(res.status, 200)
        assert.equal(res.body[randomIndex].created_by, 'TheTestFile')
        done();
      })
  })

  test('View issues on a project with multiple filters', function(done) {
    chai.request(server)
      .get('/api/issues/apitest?created_by=TheTestFile&issue_text=this is a test')
      .end((err, res) => {
        let length = res.body.length
        let randomIndex = Math.floor(Math.random() * length)
        assert.equal(res.status, 200)
        assert.equal(res.body[randomIndex].created_by, 'TheTestFile')
        assert.equal(res.body[randomIndex].issue_text, 'this is a test')
        done();
      })
  })

  test('Update one field on an issue', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: id1,
        created_by: 'TheTestFile'
      })
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.text, '{"result":"successfully updated","_id":"'+ id1 +'"}')
        done();
      })
  })

  test('Update multiple fields on an issue', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: id2,
        created_by: 'TheTestFile',
        issue_text: 'second test of "put"'
      })
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.text, '{"result":"successfully updated","_id":"'+ id2 +'"}')
        done();
      })
  })

  test('Update an issue with missing _id', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        created_by: 'TheTestFile',
        issue_text: 'third test of "put"'
      })
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.body.error, 'missing _id')
        done();
      })
  })

  test('Update an issue with no fields to update', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: '600af3339acb860205bac7c1'
      })
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.text, '{"error":"no update field(s) sent","_id":"600af3339acb860205bac7c1"}')
        done();
      })
  })

  test('Update an issue with an invalid _id', function(done) {
    chai.request(server)
      .put('/api/issues/apitest')
      .send({
        _id: 'invalid id'
      })
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.text, '{"error":"no update field(s) sent","_id":"invalid id"}')
        done();
      })
  })

  test('Delete an issue', function(done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({
        _id: id1
      })
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.body.result, "successfully deleted")
        assert.equal(res.body._id, id1)
        assert.equal(res.text, '{"result":"successfully deleted","_id":"'+id1+'"}')
      })

    chai.request(server)
      .delete('/api/issues/apitest')
      .send({
        _id: id2
      })
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.body.result, "successfully deleted")
        assert.equal(res.body._id, id2)
        assert.equal(res.text, '{"result":"successfully deleted","_id":"'+id2+'"}')
        done();
      })
  })

  test('Delete an issue with an invalid _id', function(done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({
        _id: 'invalid id'
      })
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.text, '{"error":"could not delete","_id":"invalid id"}')
        done();
      })
  })

  test('Delete an issue with missing _id', function(done) {
    chai.request(server)
      .delete('/api/issues/apitest')
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200)
        assert.equal(res.text, '{"error":"missing _id"}')
        done();
      })
  })
});