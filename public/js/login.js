const url = 'http://127.0.0.1:3000/api/v1/users/login';

const login = async (email, password) => {
};

window.addEventListener('DOMContentLoaded',  (event) => {
  document.querySelector('.form').addEventListener('submit',  event => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  })
});