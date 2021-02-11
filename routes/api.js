'use strict';

var mongoose = require('mongoose')
const { Schema } = mongoose

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

const issueSchema = new Schema({
  issue_title: {type: String, required: true},
  issue_text: {type: String, required: true},
  created_on: String,
  updated_on: String,
  created_by: {type: String, required: true},
  assigned_to: {type: String, default: ''},
  open: {type: Boolean, default: true},
  status_text: {type: String, default: ''},
  project: String
}, {versionKey: false})

let Issue = mongoose.model('Issue', issueSchema)

module.exports = function (app) {

  app.route('/api/issues/:project')
    .get(function (req, res){
      let project = req.params.project;

      Issue.find({project: project})
        .find(req.query)
        .exec((err, data) => {
          if(!err) {
            res.send(data)
          }
        })
    })
    
    .post(function (req, res){
      let project = req.params.project;
      let title = req.body.issue_title
      let text = req.body.issue_text
      let creator = req.body.created_by
      let assigned = req.body.assigned_to
      let status = req.body.status_text

      let issue = Issue({
        issue_title: title,
        issue_text: text,
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        created_by: creator,
        assigned_to: assigned,
        status_text: status,
        project: project
      })

      issue.save((err, data) => {
        if(!err) {
          res.send(data)
        } else {
          res.send({"error": "required field(s) missing"})
        }
      })
    })
    
    .put(function (req, res){
      let project = req.params.project;
      let id = req.body._id
      let title = req.body.issue_title
      let text = req.body.issue_text
      let creator = req.body.created_by
      let assigned = req.body.assigned_to
      let status = req.body.status_text
      let open = req.body.open

      if(!id) {
        res.send({ error: 'missing _id' })
      } else if(!title && !text && !creator && !assigned && !status && open === undefined) {
        res.send({ error: 'no update field(s) sent', '_id': id })
      } else {
          Issue.findById(id, (err, data) => {
          if(!err && data != null) {
            data['issue_title'] = title || data['issue_title']
            data['issue_text'] = text || data['issue_text']
            data['created_by'] = creator || data['created_by']
            data['assigned_to'] = assigned || data['assigned_to']
            data['status_text'] = status || data['status_text']
            data['open'] = open || data['open']
            data['updated_on'] = new Date().toISOString()

            data.save((err, updatedIssue) => {
              if(!err) {
                res.send({ result: 'successfully updated', '_id': id })
              }
            })
          } else {
            res.send({error: 'could not update', '_id': id})
          }
        })
      }

      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      let id = req.body._id

      if(!id) {
        res.send({ error: 'missing _id' })
      } else {
        Issue.findByIdAndRemove(id, (err, data) => {
          if(!err && data !== null) {
            res.send({result: 'successfully deleted', '_id': id})
          } else {
           res.send({error: 'could not delete', '_id': id})
          }
        })
      }
    }) 
};
