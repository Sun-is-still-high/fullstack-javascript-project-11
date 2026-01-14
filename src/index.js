import 'bootstrap';
import './styles.scss';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId, differenceBy } from 'lodash';
import render from './view.js';
import parse from './parser.js';
import ru from './locales/ru.js';
import en from './locales/en.js';
import bg from './locales/bg.js';

const getProxyUrl = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.set('disableCache', 'true');
  proxyUrl.searchParams.set('url', url);
  return proxyUrl.toString();
};

const validateUrl = (url, urls) => {
  const schema = yup.string()
    .required()
    .url()
    .notOneOf(urls);

  return schema.validate(url);
};

const loadRss = (url) => axios.get(getProxyUrl(url))
  .then((response) => parse(response.data.contents));

const UPDATE_INTERVAL = 5000;

const updateFeeds = (watchedState) => {
  const promises = watchedState.feeds.map((feed) => loadRss(feed.url)
    .then((data) => {
      const newPosts = differenceBy(data.posts, watchedState.posts, 'link')
        .map((post) => ({ ...post, id: uniqueId(), feedId: feed.id }));

      if (newPosts.length > 0) {
        watchedState.posts = [...newPosts, ...watchedState.posts];
      }
    })
    .catch(() => {}));

  Promise.all(promises)
    .finally(() => {
      setTimeout(() => updateFeeds(watchedState), UPDATE_INTERVAL);
    });
};

const app = () => {
  yup.setLocale({
    mixed: {
      notOneOf: 'notOneOf',
      required: 'required',
    },
    string: {
      url: 'url',
    },
  });

  const state = {
    form: {
      status: 'filling',
      error: null,
    },
    feeds: [],
    posts: [],
    urls: [],
    ui: {
      readPosts: new Set(),
      modalPostId: null,
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modalTitle: document.querySelector('#modal .modal-title'),
    modalBody: document.querySelector('#modal .modal-body'),
    modalLink: document.querySelector('#modal .full-article'),
    modalClose: document.querySelector('#modal .btn-secondary'),
  };

  i18next.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru,
      en,
      bg,
    },
  }).then(() => {
    elements.modalLink.textContent = i18next.t('readMore');
    elements.modalClose.textContent = i18next.t('close');

    const watchedState = onChange(state, render(state, elements, i18next));

    updateFeeds(watchedState);

    elements.postsContainer.addEventListener('click', (e) => {
      const { id } = e.target.dataset;
      if (!id) return;

      watchedState.ui.readPosts.add(id);
      watchedState.ui.modalPostId = id;
    });

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url').trim();

      validateUrl(url, state.urls)
        .then(() => {
          watchedState.form.status = 'sending';
          return loadRss(url);
        })
        .then((data) => {
          const feedId = uniqueId();
          const feed = { ...data.feed, id: feedId, url };
          const posts = data.posts.map((post) => ({ ...post, id: uniqueId(), feedId }));

          watchedState.urls.push(url);
          watchedState.feeds.push(feed);
          watchedState.posts = [...posts, ...state.posts];
          watchedState.form.error = null;
          watchedState.form.status = 'valid';
        })
        .catch((err) => {
          if (err.isParsingError) {
            watchedState.form.error = 'parsingError';
          } else if (err.isAxiosError) {
            watchedState.form.error = 'networkError';
          } else {
            watchedState.form.error = err.message;
          }
          watchedState.form.status = 'invalid';
        });
    });
  });
};

app();
