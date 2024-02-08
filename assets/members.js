let members = await  fetch("members.json").then(r => r.json());

// Format table of directors

function formatRows (list, subprop) {
    let html = "";
    let date = new Date();    
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();    
    let maxYear = year;
    let dateFormat = new Intl.DateTimeFormat("en-US", {dateStyle: "medium"});    
    for (let member of members.filter(x => Object.hasOwn(x,subprop)).sort((a, b) => new Date(a[subprop].date) - new Date(b[subprop].date))) {
	html += `<tr>
	<th class="name" scope="row">${member.name}</th>
	<td class="terms">`;
	
	for (let term of member[subprop]) {
	    let [sy, sm, sd] = term.start.split("-");
	    let [ey, em, ed] = term.end? term.end.split("-") : ["", ""];
	    let readableStart = dateFormat.format(new Date(term.start + "T00:00:00"));
	    let readableEnd = term.end? dateFormat.format(new Date(term.end + "T00:00:00")) : "present";
	    
	    if (ey) {
		maxYear = Math.max(maxYear, parseInt(ey));
	    }
	    
	    html += `<div class="term ${term.type} ${term.resigned? "resigned" : ""}"
		title="${term.type}, ${readableStart} – ${readableEnd} ${term.resigned? " (resigned)" : ""}" ${term.note ?? ""}
		style="--sy: ${sy}; --sm: ${sm}; --sd: ${sd}; --ey: ${ey? ey : year}; --em: ${em? em : month}; --ed: ${ed? ed : day}">
                ${term.type ? "(" + term.type + ")" : ""}
		${readableStart} - ${readableEnd}
		</div>`;
	}
        html += `</td></tr>`;
    }
    list.insertAdjacentHTML("beforeend", html);

    // 2022 is the start year of the Board of Directors
    let years = maxYear - 2022 + 1;
    list.style.setProperty("--years", years);
    
    let theadRow = $$("thead tr", list)[0];
    for (let i = 1; i <= years; i++) {
	theadRow.insertAdjacentHTML("beforeend", `<th>${2021 + i}</th>`);
    }
    
    $$("td.terms", list).forEach(th => th.colSpan = years);
    
    let container = list.closest(".container");
    if (container) {
	new ResizeObserver(_ => {
	    let rect = container.getBoundingClientRect();
	    list.style.setProperty("--container-width", rect.width + "px");
	}).observe(container);
    }
}

function $$(selector, context = document) {
	return Array.from(context.querySelectorAll(selector));
}

document.head.insertAdjacentHTML("beforeend", `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">`)
document.head.insertAdjacentHTML("beforeend", `<link rel="stylesheet" href="../assets/css/members.css">`)
formatRows(membersList, 'term');
formatRows(officersList, 'officer');
formatRows(chairsList, 'chair');
formatRows(liaisonsList, 'abliaison');

