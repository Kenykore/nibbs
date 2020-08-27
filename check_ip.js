const request = require('request-promise');
/**
 * Check ip
 *
 * @return  {String}  check ip
 */
async function checkip() {
  try {
    const options = {
      method: 'GET',
      uri: `https://power-case.natterbase.com`,
      json: true // Automatically stringifies the body to JSON
    };
    const userDetailstwo = await request(options);
    console.log(userDetailstwo, 'ip');
  } catch (error) {
    console.log(error);
  }
}
checkip().then((res)=>{
  console.log('done');
});
