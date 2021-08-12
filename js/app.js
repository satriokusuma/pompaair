let imageWrapper = document.querySelector('.wrapperImage');
const sectionAbout = document.querySelector('.sectionAbout');
const sectionMain = document.querySelector('.sectionMain');
let aboutPicture = document.querySelector('.aboutPicture');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');

window.addEventListener('scroll', animate);

function animate() {
  const initialCoords = sectionAbout.getBoundingClientRect();

  if (window.scrollY < initialCoords.top) imageWrapper.style.cssText = `transform: translateY(6rem);transition: all 0.5s ease;`;

  if (window.scrollY == 0) imageWrapper.style.cssText = `transform: translateY(0);transition: all 0.5s ease;`;

  animateAbout();
}

function animateAbout() {
  const initialCoords = sectionAbout.getBoundingClientRect();

  if (window.scrollY < initialCoords.top) aboutPicture.style.cssText = `transform: translateY(-12rem);transition: all 0.5s ease;`;

  if (window.scrollY == 0) aboutPicture.style.cssText = `transform: translateY(0);transition: all 0.5s ease;`;
}

//================ Slider Movement
const slidesImg = document.querySelectorAll('.slide');
const slideContainer = document.querySelector('.slider');
const btnLeftSlide = document.querySelector('.slider__btn--left');
const btnRightSlide = document.querySelector('.slider__btn--right');
const dotContainer = document.querySelector('.dots');
const workCard = document.querySelector('.work');

const maxSlide = slidesImg.length;
let currentSlide = 0;

const createDots = function () {
  slidesImg.forEach(function (_, index) {
    dotContainer.insertAdjacentHTML('beforeend', `<button class="dots__dot" data-slide="${index}"></button>`);
  });
};

const activateDots = function (slide) {
  document.querySelectorAll('.dots__dot').forEach(dot => dot.classList.remove('dots__dot--active'));
  document.querySelector(`.dots__dot[data-slide="${slide}"]`).classList.add('dots__dot--active');
};

const goToSlide = function (slide) {
  slidesImg.forEach((image, index) => (image.style.transform = `translateX(${100 * (index - slide)}% )`));
  // index - cuurentSlide++ (0 - 1) (1-1)(2-2)(3-3) // -100%,0,100%,200%
};

// Next Funxtion Slide
const nextSlide = function () {
  if (currentSlide === maxSlide - 1) {
    currentSlide = 0;
    workCard.style.transform = `rotate('2deg)`;
  } else {
    currentSlide++;
    // workCard.style.transform = `rotate('3deg)`;
  }
  goToSlide(currentSlide);
  activateDots(currentSlide);
};

const prevSlide = function () {
  if (currentSlide === 0) {
    currentSlide = maxSlide - 3;
  } else {
    currentSlide--;
  }
  goToSlide(currentSlide);
  activateDots(currentSlide);
};

// setInterval(nextSlide,5000);

const timeSlide = setInterval(nextSlide, 7000);

const init = function () {
  goToSlide(0);
  createDots();
  activateDots(0);
};

init();

btnRightSlide.addEventListener('click', nextSlide);
btnLeftSlide.addEventListener('click', prevSlide);

document.addEventListener('keydown', function (e) {
  // if(e.key === 'ArrowLeft') prevSlide();
  // else if(e.key === 'ArrowRight') nextSlide();
  e.key === 'ArrowLeft' && prevSlide();
  e.key === 'ArrowRight' && nextSlide();
});

dotContainer.addEventListener('click', function (e) {
  if (e.target.classList.contains('dots__dot')) {
    const { slide } = e.target.dataset;
    goToSlide(slide);
    activateDots(slide);
  }
});
