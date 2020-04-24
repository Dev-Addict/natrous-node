const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout'
    });
    location.assign('/');
  } catch (err) {
    alert(err.response.data.message);
  }
};

window.addEventListener('DOMContentLoaded',  (event) => {
  document.querySelector('.nav__el--logout').addEventListener('click',  event => {
    logout();
  })
});