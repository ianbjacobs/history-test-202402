let members = await  fetch("members.json").then(r => r.json());

// Format table of directors

function formatRows (list, subprop, subtype) {
    let html = "";
    let date = new Date();    
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let startYear = 2022; // the start of the Board of Directors
    let maxYear = year;
    let dateFormat = new Intl.DateTimeFormat("en-US", {dateStyle: "medium"});

    // Look at the list entries that correspond to the group (e.g., "chairs" or "directors") and the subclass of that group (e.g., "finance committee" or "governance committee"). Within that list, sort the entries first by start date. For all entries with the same start date, sort by last name.

    for (let member of members.filter(x => Object.hasOwn(x,subprop) && x[subprop].some(t => t.type == subtype)).sort((a,b) => a[subprop][0].start == b[subprop][0].start ? sortByNameValue(a,b) : a[subprop][0].start.localeCompare(b[subprop][0].start))) {
	html += `<tr>
	<th class="name" scope="row">${member.name}</th>
	<td class="terms">`;
	
	for (let term of member[subprop].filter(t => t.type == subtype)) {
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
		${readableStart} - ${readableEnd}
		</div>`;
	}
        html += `</td></tr>`;
    }
    list.insertAdjacentHTML("beforeend", html);

    let years = maxYear - startYear + 1;
    list.style.setProperty("--years", years);
    
    let theadRow = $$("thead tr", list)[0];
    for (let i = 1; i <= years; i++) {
	theadRow.insertAdjacentHTML("beforeend", `<th>${startYear - 1 + i}</th>`);
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

// For the purposes of sorting, takes two objects. Each object must have a "name" property and may have a "sortby" property. If sortby is present use it, otherwise default to approach that splits the name into parts and assumes the last part is for sorting.

function sortByNameValue (a, b) {
    let aname = a.sortname ? a.sortname : a.name.split(' ').pop();
    let bname = b.sortname ? b.sortname : b.name.split(' ').pop();
    return aname.localeCompare(bname);
}

function $$(selector, context = document) {
	return Array.from(context.querySelectorAll(selector));
}

document.head.insertAdjacentHTML("beforeend", `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap-reboot.css" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">`)
document.head.insertAdjacentHTML("beforeend", `<link rel="stylesheet" href="../assets/css/members.css">`)

// Directors
formatRows(electedDirectors, 'term', 'elected');
formatRows(partnerDirectors, 'term', 'partner');
formatRows(appointedDirectors, 'term', 'appointed');

// Officers

formatRows(presidentOfficers, 'officer', 'president');
formatRows(treasurerOfficers, 'officer', 'secretary');
formatRows(secretaryOfficers, 'officer', 'treasurer');

// Chairs of Board and Committees

formatRows(boardChair, 'chair', 'board');
formatRows(governanceCommittee, 'chair', 'governance-committee');
formatRows(financeCommittee, 'chair', 'finance-committee');
formatRows(personnelCommittee, 'chair', 'personnel-committee');
formatRows(auditCommittee, 'chair', 'audit-committee');
formatRows(boardDevelopmentCommittee, 'chair', 'board-development-committee');

// AB Liaisons

formatRows(liaisonsList, 'abliaison', 'ab-liaison');

