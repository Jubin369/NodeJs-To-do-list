//const server = require('../server');
const request = require("request");
const mongoose = require('mongoose');

const chai = require("chai"), chaiHttp = require('chai-http');

const should = chai.should();
const expect = require('chai').expect;

chai.use(chaiHttp);

mongoose.connect('mongodb://admin:admin123@127.0.0.1:27017/admin');
let db = mongoose.connection;

let Todos=require('../models/todos');

describe('App todos:',function(){

    it("Checking database connection",function(done){
        
        db.once('open',function(){
            chai.assert.isOk("everything"," Database connection successful");
            done();
        });
        db.on('error',function(err){
            chai.assert.isNotOk(false,"Database connection not successful");
            done();
        });
    });

    it("testing sample insertion of todos data",(done)=>{
        let todos={
            value: 'to do data 1',
            orderNotDone: 1
        };
        chai.request('http://localhost:8000')
            .post('/')
            .type('application/x-www-form-urlencoded')
            .send(todos)
            .end((err,res)=>{
                let body = res.body;
                expect(res.status).to.equal(200);
                chai.assert.equal(body.msg,'Todos Inserted');
                done();
        });
    });

    it("Checking get request of todos data",(done)=>{
        chai.request('http://localhost:8000')
        .get('/')
        .end((err,res)=>{
            let data= res.body;
            if(err){
                chai.assert.ifError(err);
                done();
            }else {
                expect(res.status).to.equal(200);
                should.exist(data);
                done();
            }
        });
    });

    it('Checking deleion of todos data', (done) => {
        let todos = new Todos();
        todos.orderNotDone =2;
        todos.toDoData = "todos data 2";
        todos.save(function(err, data){
            let id = {
                id:data.id
            };
            chai.request('http://localhost:8000')
                .delete('/')
                .type('application/x-www-form-urlencoded')
                .send(id)
                .end((err,res)=>{
                    let body = res.body;
                    expect(res.status).to.equal(200);
                    chai.assert.equal(body.msg,'Todos Deleted');
                    done();
                });
        });
    });

    it("testing deletion of todos data for existing data",function(done){
        Todos.find({},function(err,todos){
            if(todos[0].id){
                let id ={ id:todos[0].id};
                chai.request('http://localhost:8000')
                    .delete('/')
                    .type('application/x-www-form-urlencoded')
                    .send(id)
                    .end((err,res)=>{
                        let body = res.body;
                        expect(res.status).to.equal(200);
                        chai.assert.equal(body.msg,'Todos Deleted');
                        done();
                  });
                
            }else{
                chai.assert.isOk(true," currently no data exist");
                done();
            }
        });
    });

    it('Updation of todos data on selection', (done) => {
        let todos = new Todos();
        todos.orderNotDone=2;
        todos.toDoData="test data for todos selection";
        todos.save((err,data)=>{
            let sampleData={ 
                id: data.id,
                orderDone: 1,
                orderNotDone: 1,
                chkBox: true 
            };
            chai.request('http://localhost:8000')
                .put('/')
                .type('application/x-www-form-urlencoded')
                .send(sampleData)
                .end((err,res)=>{
                    let body = res.body;

                    expect(res.status).to.equal(200);
                    chai.assert.equal(body.msg,"Select unique");
                    done();
                });
        });
    });
});


