import './styles.scss';
import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';

const validateUrl = (url, feeds) => {
  const schema = yup.string()
    .required('Не должно быть пустым')
    .url('Ссылка должна быть валидным URL')
    .notOneOf(feeds, 'RSS уже существует');

  return schema.validate(url);
};

const app = () => {
  const state = {
    form: {
      status: 'filling',
      error: null,
    },
    feeds: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
  };

  const watchedState = onChange(state, render(state, elements));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url').trim();

    validateUrl(url, state.feeds)
      .then((validUrl) => {
        watchedState.feeds.push(validUrl);
        watchedState.form.error = null;
        watchedState.form.status = 'valid';
      })
      .catch((err) => {
        watchedState.form.error = err.message;
        watchedState.form.status = 'invalid';
      });
  });
};

app();
