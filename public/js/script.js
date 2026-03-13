(() => {
  'use strict';

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation');

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated')
    }, false)
  });
})();

let likeBtns = document.querySelectorAll(".like-btn");

likeBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.preventDefault(); // stop link redirect

        let icon = btn.querySelector("i");

        icon.classList.toggle("fa-regular");
        icon.classList.toggle("fa-solid");
        icon.classList.toggle("liked");
    });
});