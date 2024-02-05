let response = await fetch("members.json");
let members = await response.json();

// Format table of directors

function formatRows (list, subprop) {
    let html = "";
    let maxYear = new Date().getFullYear();
    let dateFormat = new Intl.DateTimeFormat("en-US", {dateStyle: "medium"});    
    for (let member of members.filter(x => Object.hasOwn(x,subprop))) {
	html += `<tr>
	<th class="name" scope="row">${member.name}</th>
	<td class="terms">`;
	
	for (let term of member[subprop]) {
	    let [sy, sm, sd] = term.start.split("-");
	    let [ey, em, ed] = term.end? term.end.split("-") : ["", ""];
	    let readableStart = dateFormat.format(new Date(term.start));
	    let readableEnd = term.end? dateFormat.format(new Date(term.end)) : "present";
	    
	    if (ey) {
		maxYear = Math.max(maxYear, parseInt(ey));
	    }
	    
	    html += `<div class="term ${term.type} ${term.resigned? "resigned" : ""}"
		title="${term.type}, ${readableStart} – ${readableEnd} ${term.resigned? " (resigned)" : ""}" ${term.note ?? ""}
		style="--sy: ${sy}; --sm: ${sm}; --sd: ${sd}; --ey: ${ey}; --em: ${em}; --ed: ${ed}">
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

formatRows(membersList, 'term');
formatRows(officersList, 'officer');
formatRows(chairsList, 'chair');
formatRows(liaisonsList, 'abliaison');

