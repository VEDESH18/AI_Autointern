module.exports = {
  apps: [{
    name: "autoapply-backend",
    script: "./backend/src/server.js",
    instances: 2,
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production"
    }
  }, {
    name: "scrape-worker",
    script: "./workers/scrape.worker.js",
    instances: 1
  }, {
    name: "apply-worker",
    script: "./workers/apply.worker.js",
    instances: 1
  }, {
    name: "interview-worker",
    script: "./workers/interview.worker.js",
    instances: 1
  }]
}
