const url = 'http://127.0.0.1:3000/api/v1/users/login';

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signin',
      withCredentials: true,
      data: {
        email,
        password
      }
    });
    location.assign('/');
  } catch (err) {
    alert(err.response.data.message);
  }
};

window.addEventListener('DOMContentLoaded',  (event) => {
  document.querySelector('.form').addEventListener('submit',  event => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  })
});