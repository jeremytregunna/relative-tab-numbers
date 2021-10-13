const browser = window.browser || window.chrome

const numToSuperscript = (number) => {
  const numbers = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹']
  const components = [...number + ''].map(Number)
  return components.map(n => { return numbers[n] }).join('')
}

const update = function(details, currentIndex) {
  const { id, index, title, windowId } = details
  if (!id || !title || !index || !currentIndex) return

  const diff = Math.abs(index - currentIndex)
  const superdiff = numToSuperscript(diff)
  const origTitle = title.replace(/^[⁰¹²³⁴⁵⁶⁷⁸⁹]+/, '')
  const newTitle = superdiff + origTitle

  try {
    browser.tabs.executeScript(
      id,
      { code: `document.title = ${JSON.stringify(newTitle)}` }
    )
  } catch(e) {
    console.log('relative tab numbering error:', e)
  }
}

function updateAll() {
  let currentIndex = 0
  browser.tabs.query({currentWindow: true, active: true}, function(tabs) {
    tabs.forEach(tab => {
      if (tab.active) {
        currentIndex = tab.index
      }
    })
  })

  browser.tabs.query({currentWindow: true}, function(tabs) {
    tabs.forEach(tab => update(tab, currentIndex))
  })
}

browser.tabs.onActivated.addListener((activeInfo) => {
  updateAll()
})

browser.tabs.onMoved.addListener(updateAll)
// firefox seems to do this inconsistently, thus this setTimeout kludge:
browser.tabs.onRemoved.addListener(() => {
  updateAll()
  setTimeout(updateAll, 100)
  setTimeout(updateAll, 500)
  setTimeout(updateAll, 1000)
})
browser.tabs.onUpdated.addListener(() => {
  updateAll()
})

updateAll()
