/**
  * @param {String} url - address for the HTML to fetch
  * @return {String} the resulting HTML string fragment
  */
async function fetchHtmlAsText(url) {
    return await (await fetch(url)).text();
}

function processOfferings() {
		const offerings = document.querySelectorAll('.offering')
		for (var i = 0; i < offerings.length; i++) {
				let offering = offerings[i]
				offering.addEventListener('click', async () => {
					const offerName = offering.querySelector('b').innerHTML
					const subject = `Interested in: ${offerName}`
					const body = [
            'Hey Luke,',
            '',
            `I'm interested in your "${offerName}".`,
            '',
            '___',
            '',
            'Sincerely,',
            '',
            '___'].join('%0D%0A')
					window.open(`mailto:lkgwbr@gmail.com?subject=${subject}&body=${body}`);
				})
		}
}

function processHeaders(par) {
		if (!par) par = document
		const headerGroups = par.querySelectorAll('.header-group')
		for (var i = 0; i < headerGroups.length; i++) {
				let header = headerGroups[i]
				let children = header.children
				const content = header.querySelector('.content')
				for (var j = 0; j < children.length; j++) {
						const child = children[j]
						if (child.tagName.length > 2 || child.tagName.startsWith('h')) {
							continue
						}
						const id = child.innerHTML.toLowerCase().trim()
						child.addEventListener('click', async () => {
							_ = [...child.parentNode.children].forEach(
								sib => sib.classList.remove('selected')
							)
							child.classList.add('selected')
							content.innerHTML = await fetchHtmlAsText(`/page/${id}.html`)
							processHeaders(content)
							processOfferings()
						})
				}
				children[0].click()
		}
}

function writeCopyright() {
    const copyrightElement = document.querySelector('#copyright')
    const currentYear = new Date().getFullYear()
    copyrightElement.innerHTML = `&copy; Copyright ${currentYear} Luke Weber`
}

function main() {
    writeCopyright()
		processHeaders()
		processOfferings()
}

main()

window.onhashchange = function() { 
    //code  
    console.log('location changed!');
}
