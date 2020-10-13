// Sliders Module
const Sliders = function () {
  // Private variables and functions that only
  // ..other private or public functions may access
  // ..and cannot be accessed outside this Module
  let sliderIdNum = 0

  // All the properties and methods contained by
  // ..this object being returned will be public
  // ..and will be accessible in the global scope.
  return {
    createSliders: function (idx, div, howManyToCreate, options) {
      const sliders = []
      const d = document.createDocumentFragment()

      for (let i = 0; i < howManyToCreate; i++) {
        const range = document.createElement('input')
        range.type = 'range'
        sliderIdNum += 1
        range.id = 'sliderRange' + sliderIdNum
        range.min = '0'
        range.max = '100'
        range.value = '100'
        range.setAttribute('class', 'slider-square')
        if (options.toolbarOn) {
          range.style.display = 'none'
        } else {
          range.style.display = 'inline' // bc we have a btn to toggle it
        }

        d.appendChild(range) // append div to fragment
        div.appendChild(d) // append fragment to parent
        sliders.push(range)
      }
      return sliders
    },
    sliderButtonEvent: function (idx, sliders) {
      const btnSlide = document.getElementById('btnSlide' + idx)
      // eslint-disable-next-line no-undef
      if (isRealValue(btnSlide)) {
        btnSlide.addEventListener('click', function () {
          // (2) sliders.
          if (sliders[0].style.display === 'none') { // no need to check both; just the one.
            // Show the sliders
            sliders[0].style.display = 'inline'
            sliders[1].style.display = 'inline'

            // Style the button
            this.innerHTML = '<i class="fa fa-sliders"></i> Hide sliders'
          } else {
            // Hide the sliders
            sliders[0].style.display = 'none'
            sliders[1].style.display = 'none'

            // Style the button
            this.innerHTML = '<i class="fa fa-sliders"></i> Show sliders'
          }
          toggleButtonHighlight(btnSlide) // eslint-disable-line no-undef
        })
      } else {
        console.log('slide is null')
      }
    },

    walk: function () {
      if (!isAlive) {
        alert('Dead man can\'t walk')
        return
      }

      alert(name + ': Walking')
      growOld()
      loseWeight()
    },

    eat: function () {
      if (!isAlive) {
        alert('Dead man can\'t eat')
      }
      alert(name + ': Eating..')
      gainWeight()
    },

    getInfo: function () {
      alert('Age: ' + age + '/' + maxAge + '\nWeight: ' + weight + '/' + maxWeight)
    }
  }
}
