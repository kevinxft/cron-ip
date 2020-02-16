const http = require('http');
const nodemailer = require('nodemailer');
const CronJob = require('cron').CronJob;
require('dotenv').config();

const getIP = async () => {
  const url = 'http://txt.go.sohu.com/ip/soip';
  return await new Promise((resolve, reject) => {
    http
      .get(url, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          let m = data.match(/\d+\.\d+\.\d+\.\d+/g);
          if (m.length > 0) {
            const ip = m[0];
            return resolve(ip);
          }
          return reject('ip地址获取失败');
        });
      })
      .on('error', e => reject(e.message));
  });
};

const sendMail = async message => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.163.com',
    secure: true,
    port: 465,
    auth: {
      user: process.env.FROM,
      pass: process.env.PASS
    }
  });

  await transporter.sendMail(
    {
      from: `"树莓派" <${process.env.FROM}>`,
      to: process.env.TO,
      subject: '树莓派的外网IP地址',
      text: message
    },
    (error, info) => {
      if (error) {
        return reject(error);
      }
      resolve(info);
    }
  );
};

const job = new CronJob(
  '0 0 0/12 * * *',
  async () => {
    const ip = await getIP();
    await sendMail(ip);
  },
  () => console.log('job stop'),
  true,
  'Asia/Shanghai'
);


job.start()
