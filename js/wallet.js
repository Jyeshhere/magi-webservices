
let username, password, address, captcha, captchainfo, email, passwordConfirm, priv_key;
const api = "https://zapex.xyz";
if (!window.location.href.includes("zapex.xyz"))
	window.location.href = "https://zapex.xyz/";

let adBlockEnabled = false;
const googleAdUrl =
	"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
try {
	fetch(new Request(googleAdUrl)).catch((_) => (adBlockEnabled = true));
} catch (e) {
	adBlockEnabled = true;
}

function boo() {
	var audio = new Audio('../images/ghost-sound.mp3');
	audio.play();
}

String.prototype.escape = function() {
	var tagsToReplace = {
		"&": " ",
		"\\": " ",
		"/": " ",
		"(": " ",
		")": " ",
		"`": " ",
		"<": " ",
		">": " ",
	};
	return this.replace(/[&<>]/g, function(tag) {
		return tagsToReplace[tag] || tag;
	});
};

function update_element(element, value) {
	element = "#" + element;
	old_value = $(element).text();

	if ($("<div>" + value + "</div>").text() != old_value) {
		$(element).fadeOut("fast", function() {
			$(element).html(value);
			$(element).fadeIn("fast");
		});
	}
}

function round_to(precision, value) {
	value = parseFloat(value);
	power_of_ten = 10 ** precision;
	return Math.round(value * power_of_ten) / power_of_ten;
}

function scientific_prefix(prefix, value) {
	value = parseFloat(value);
	if (value / 1000000000 > 0.5)
		value = round_to(3, value / 1000000000) + " G";
	else if (value / 1000000 > 0.5) value = round_to(3, value / 1000000) + " M";
	else if (value / 1000 > 0.5) value = round_to(3, value / 1000) + " k";
	else value = round_to(3, value) + " ";
	return value + prefix;
}

function timeSince(date) {
	var date = new Date(date);
	date.setTime(date.getTime() - date.getTimezoneOffset()*60*1000 );

	var seconds = Math.floor((new Date() - date) / 1000);

	var interval = seconds / 31536000;
	if (interval > 1) {
		if (Math.floor(interval) == 1) {
			return Math.floor(interval) + " year";
		}
		return Math.floor(interval) + " years";
	}
	interval = seconds / 2592000;
	if (interval > 1) {
		if (Math.floor(interval) == 1) {
			return Math.floor(interval) + " month";
		}
		return Math.floor(interval) + " months";
	}
	interval = seconds / 86400;
	if (interval > 1) {
		if (Math.floor(interval) == 1) {
			return Math.floor(interval) + " day";
		}
		return Math.floor(interval) + " days";
	}
	interval = seconds / 3600;
	if (interval > 1) {
		if (Math.floor(interval) == 1) {
			return Math.floor(interval) + " hour";
		}
		return Math.floor(interval) + " hours";
	}
	interval = seconds / 60;
	if (interval > 1) {
		if (Math.floor(interval) == 1) {
			return Math.floor(interval) + " minute";
		}
		return Math.floor(interval) + " minutes";
	}
	return Math.floor(seconds) + " secs";
}
var aDay = 24 * 60 * 60 * 1000;

function toggle_theme() {
	document.getElementById("glossy_theme").toggleAttribute("disabled");

	state = $("#glossy_theme").attr("disabled");
	localStorage.setItem("theme", state);
}

if (localStorage.getItem("theme")) {
	if (localStorage.getItem("theme") == "disabled") {
		$("#glossy_theme").attr("disabled", true)
	} else {
		$("#glossy_theme").attr("disabled", false)
	}
}

function fetch_data(username) {
	$.getJSON(
		"https://magi.duinocoin.com/users/" + encodeURIComponent(username) + "?limit=10",
		function(data) {
			data = data.result;
			address = data.balance.address;
			balance = data.balance.balance.toString();
			staked_balance = round_to(4, data.balance.staked_balance);
			balanceusd = round_to(4, balance * data.price.max).toString();
			update_element("username", `${data.balance.username}`);
			if (parseFloat(balance) > 0) update_element("balance", `${balance.split(".")[0]}<span class="has-text-weight-normal">.${balance.split(".")[1]}</span> Î£`);
			else update_element("balance", `0<span class="has-text-weight-normal">.0</span> Î£`);
			update_element("staked_balance", `${staked_balance} Î£`);
			if (parseFloat(balanceusd) > 0) update_element("balanceusd", `â‰ˆ $${balanceusd.split(".")[0]}<small>.${balanceusd.split(".")[1]}</small>`);
			else update_element("balanceusd", `â‰ˆ $0<small>.0</small>`);
			update_element(
				"price_ducoe",
				`â‰ˆ $${round_to(5, data.price.ducoexchange)}`
			);
			/*update_element(
				"price_pancake",
				`â‰ˆ $${round_to(5, data.price.pancakeswap)}`
			);*/
			update_element(
				"price_fluffy",
				`â‰ˆ $${round_to(6, data.price.fluffy)}`
			);
			update_element("price_btcpop",
				`â‰ˆ $${round_to(5, data.price.btcpop)}`
			);
			//update_element("price_moondex", `â‰ˆ $${round_to(4, data.price.moondex)}`)

			$("#cryptoid_link").attr("href", `https://chainz.cryptoid.info/xmg/address.dws?${address}.htm`)

			transactions_html = "";
			data.transactions = data.transactions.reverse();

			if (!data.transactions.length) {
				transactions_html = "No transactions (yet!)..."
			}

			for (transaction in data.transactions) {
				transaction = data.transactions[transaction];
				if (transaction.memo === "none") transaction.memo = "";
				else transaction.memo = `<i>"${transaction.memo}"</i>`;

				if (
					transaction.recipient == username ||
					transaction.recipient == address
				) {
					is_local = "";
					if (transaction.sender) {
						is_local = `
									<span>
										from
									</span>
									<b>
										<monospace>${transaction.sender}</monospace>
									</b>`;
					}
					thtml = `
							<div class="column is-full">
								<p class="title is-size-6 has-text-weight-normal">
									<i class="fa fa-arrow-left fa-fw has-text-success"></i>
									<span>
										Received <b>${
											transaction.amount
										} XMG</b>
									</span>
									${is_local}
									<span class="has-text-weight-normal">
										${transaction.memo}
									</span>
								</p>
								<p class="subtitle is-size-7">
									<span>
										<i class="fa fa-clock fa-fw"></i>
										${timeSince(transaction.datetime)} ago
									</span>
									<span>
										<i class="fa fa-check fa-fw"></i>
										${transaction.confirmations} confirmations
									</span>
									<i class="fa fa-hashtag fa-fw"></i>
									<a href="https://magi.duinocoin.com/?search=${
										transaction.hash
									}" target="_blank">
										<monospace>${transaction.hash.substr(-16)}...</monospace>
									</a>
								</p>
							</div>`;
				} else {
					thtml = `
							<div class="column is-full">
								<p class="title is-size-6 has-text-weight-normal">
									<i class="fa fa-arrow-right fa-fw has-text-danger"></i>
									<span>
										Sent <b>${transaction.amount} XMG</b>
									</span>
									<span>
										to
									</span>
									<b>
										<monospace>${
											transaction.recipient
										}</monospace>
									</b>
									<span class="has-text-weight-normal">
										${transaction.memo}
									</span>
								</p>
								<p class="subtitle is-size-7">
									<span>
										<i class="fa fa-clock fa-fw"></i>
										${timeSince(transaction.datetime)} ago
									</span>
									<span>
										<i class="fa fa-check fa-fw"></i>
										${transaction.confirmations} confirmations
									</span>
									<i class="fa fa-hashtag fa-fw"></i>
									<a href="https://magi.duinocoin.com/?search=${
										transaction.hash
									}" target="_blank" title="${transaction.hash}">
										<monospace>${transaction.hash.substr(-16)}...</monospace>
									</a>
								</p>
							</div>`;
				}
				transactions_html += thtml;
			}
			update_element("transactions", transactions_html);
		}
	).fail(function() {
		show_modal("Network error. Most likely maintenance in progress!", "Error");
	});
}

function stakeinfo() {
	$.getJSON("https://magi.duinocoin.com/statistics", function(data) {
		data = data.result;
		update_element(
			"stake_interest",
			round_to(4, data.stake_interest) + " Î£"
		);
		if (data.hours_to_stake > 1) {
			update_element("stake_hours", `~ ${data.hours_to_stake} hours`);
		}
		if (data.hours_to_stake == 1) {
			update_element("stake_hours", `~ ${data.hours_to_stake} hour`);
		} else {
			update_element("stake_hours", `~ ${round_to(0, data.hours_to_stake*60)} minutes`);
		}

	}).fail(function() {
		console.log("Error getting stake info");
	});
}

function login(username, password) {
	$.getJSON(
		"https://magi.duinocoin.com/auth/" +
		encodeURIComponent(username) +
		"?password=" +
		encodeURIComponent(password),
		function(data) {
			if (data.success == true) {
				if ($("#remember").is(":checked")) {
					setcookie("password", password, 30);
					setcookie("username", username, 30);
				}
				$("#loginbutton").removeClass("is-loading");
				$("#loginsection").fadeOut('fast', function() {
					$("#walletsection").fadeIn('fast', function() {
						if (adBlockEnabled) {
							$("#adblocker_detected").show();
							$("#giftbutton").attr("data-tooltip", "Disable adblock, I'm paying for this ðŸ˜•");
							$("#giftbutton").attr("disabled", true);
						}
						else {
							(adsbygoogle =
								window.adsbygoogle || []).push({});
						}
					});
				});

				fetch_data(username);
				stakeinfo();
				setInterval(function() {
					fetch_data(username);
				}, 30 * 1000);

				console.log(getcookie("lastclaim"));
				if (new Date() - new Date(getcookie("lastclaim")) < 3600000) {
					$("#giftbutton").attr("data-tooltip", "Come back in an hour ðŸ˜Š");
					$("#giftbutton").attr("disabled", true);
				}
			} else {
				$("#loginbutton").removeClass("is-loading");
				show_modal(data.message, "Error");
			}
		}
	).fail(function() {
		$("#loginbutton").removeClass("is-loading");
		show_modal("Network error. Most likely maintenance in progress!", "Error");
	});
}

function claim(captcha) {
	$("#giftbutton").addClass("is-loading");
	$.getJSON(
			"https://magi.duinocoin.com/faucet_claim" +
			"?username=" +
			encodeURIComponent(username) +
			"&captcha=" +
			encodeURIComponent(captcha),
			function(data) {
				if (data.success == true) {
					$("html").removeClass("is-clipped");
					$("#modal").removeClass("is-active");
					$("#giftbutton").removeClass("is-loading");
					show_modal(
						"<b>Claimed hourly reward</b>!<br>" +
						`<a href="https://magi.duinocoin.com?search=${data.result}">
							View transaction in explorer
						</a><br>` +
						"Return in an hour <b>for  more</b> ðŸ˜Š",
						"Success"
					);
					$("#giftbutton").attr("data-tooltip", "Come back in an hour ðŸ˜Š");
					$("#giftbutton").attr("disabled", true);
					setcookie("lastclaim", new Date(), 1);
					setTimeout(function() {
						$("#giftbutton").attr("data-tooltip", "")
						$("#giftbutton").attr("disabled", false);
					}, 60*60*1000)
				} else {
					$("html").removeClass("is-clipped");
					$("#modal").removeClass("is-active");
					$("#giftbutton").removeClass("is-loading");
					show_modal(data.message, "Error");
				}
			}
		).fail(function() {
			$("html").removeClass("is-clipped");
			$("#modal").removeClass("is-active");
			$("#giftbutton").removeClass("is-loading");
			show_modal("Network error. Most likely maintenance in progress!", "Error");
		});
}

function show_modal(content, title) {
	$("#modal .modal-card-title").html(title);
	$("#modal-content").html(content);
	//$("html").addClass("is-clipped");
	$("#modal").addClass("is-active");
}

function show_register_modal() {
	//$("html").addClass("is-clipped");
	$("#register_modal").addClass("is-active");
	$("#register_modal .modal-card-title").html(
		"Register on Coin Magi network"
	);
}

function wrap_funds() {
	address = $("#address").val();
	amount = $("#wrap_amount").val();
	console.log(address, amount);

	if (address && amount) {
		$("#wrapbutton").addClass("is-loading");
		$.getJSON(
			"https://magi.duinocoin.com/wrap/" +
			"?username=" +
			encodeURIComponent(username) +
			"&password=" +
			encodeURIComponent(password) +
			"&address=" +
			encodeURIComponent(address) +
			"&amount=" +
			encodeURIComponent(amount),
			function(data) {
				if (data.success == true) {
					$("html").removeClass("is-clipped");
					$("#modal").removeClass("is-active");
					$("#wrapbutton").removeClass("is-loading");
					show_modal(
						"Successfully wrapped XMG to WXMG" +
						`<br>TXID: <a href="https://bscscan.com/tx/${data.result}">
							<monospace>${data.result}</monospace></a>`,
						"Success"
					);
				} else {
					$("html").removeClass("is-clipped");
					$("#modal").removeClass("is-active");
					$("#wrapbutton").removeClass("is-loading");
					show_modal(data.message, "Error");
				}
			}
		).fail(function() {
			$("html").removeClass("is-clipped");
			$("#modal").removeClass("is-active");
			$("#wrapbutton").removeClass("is-loading");
			show_modal("Network error. Most likely maintenance in progress!", "Error");
		});
	}
}

function unwrap_funds() {
	unwraptx = $("#unwraptx").val();
	console.log(unwraptx);

	if (unwraptx) {
		$("#unwrapbutton").addClass("is-loading");
		$.getJSON(
			"https://magi.duinocoin.com/unwrap/" +
			"?username=" +
			encodeURIComponent(username) +
			"&password=" +
			encodeURIComponent(password) +
			"&tx_hash=" +
			encodeURIComponent(unwraptx),
			function(data) {
				if (data.success == true) {
					$("html").removeClass("is-clipped");
					$("#modal").removeClass("is-active");
					$("#unwrapbutton").removeClass("is-loading");
					show_modal(
						"Successfully unwrapped WXMG to XMG" +
						`<br>TXID: <a href="https://magi.duinocoin.com/?search=${data.result}">
							<monospace>${data.result}</monospace></a>`,
						"Success"
					);
				} else {
					$("html").removeClass("is-clipped");
					$("#modal").removeClass("is-active");
					$("#unwrapbutton").removeClass("is-loading");
					show_modal(data.message, "Error");
				}
			}
		).fail(function() {
			$("html").removeClass("is-clipped");
			$("#modal").removeClass("is-active");
			$("#unwrapbutton").removeClass("is-loading");
			show_modal("Network error. Most likely maintenance in progress!", "Error");
		});
	}
}

function send_funds() {
	recipient = $("#recipient").val();
	amount = $("#amount").val();
	memo = $("#memo").val();
	console.log(recipient, amount, memo);
	if (recipient && amount) {
		$("#sendbutton").addClass("is-loading");
		$.getJSON(
			"https://magi.duinocoin.com/transaction/" +
			"?username=" +
			encodeURIComponent(username) +
			"&password=" +
			encodeURIComponent(password) +
			"&recipient=" +
			encodeURIComponent(recipient) +
			"&amount=" +
			encodeURIComponent(amount) +
			"&memo=" +
			encodeURIComponent(memo),
			function(data) {
				if (data.success == true) {
					$("html").removeClass("is-clipped");
					$("#modal").removeClass("is-active");
					$("#sendbutton").removeClass("is-loading");
					show_modal(
						"Successfully transferred funds" +
						`<br>TXID: <a href="https://magi.duinocoin.com/?search=${
								data.result.split(",")[2]
							}">
							<monospace>${
								data.result.split(",")[2]
							}</monospace></a>`,
						"Success"
					);
				} else {
					$("html").removeClass("is-clipped");
					$("#modal").removeClass("is-active");
					$("#sendbutton").removeClass("is-loading");
					show_modal(data.message.split(",")[1], "Error");
				}
			}
		).fail(function() {
			$("html").removeClass("is-clipped");
			$("#modal").removeClass("is-active");
			$("#sendbutton").removeClass("is-loading");
			show_modal("Network error. Most likely maintenance in progress!", "Error");
		});
	}
}

function setcookie(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		var expires = "; expires=" + date.toGMTString();
	} else var expires = "";
	document.cookie = name + "=" + value + expires + ";path=/";
}

function getcookie(cname) {
	let name = cname + "=";
	let decodedCookie = decodeURIComponent(document.cookie);
	let ca = decodedCookie.split(";");
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return undefined;
}

function delcookie(name) {
	document.cookie = name + "=; Max-Age=-99999999;";
}

function logout() {
	delcookie("username");
	delcookie("password");
	window.location.reload(true);
}

function setErrorFor(input, message) {
	input.classList.add("is-danger");
	const field = input.parentElement;
	const small = field.querySelector("small");
	small.innerText = message;
}

function setSuccessFor(input) {
	input.classList.remove("is-danger");
	const field = input.parentElement;
	const small = field.querySelector("small");
	small.innerText = "";
}

function isEmail(email) {
	return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
		email
	);
}

function checkInputs() {
	const usernameValue = username.value.trim();
	const emailValue = email.value.trim();
	const passwordValue = password.value.trim();
	const passwordConfirmValue = passwordConfirm.value.trim();

	let isFormValid = true;

	if (usernameValue === "") {
		setErrorFor(username, "Username cannot be blank.");
		isFormValid = false;
	} else {
		setSuccessFor(username);
	}

	if (emailValue === "") {
		setErrorFor(email, "Email cannot be blank.");
		isFormValid = false;
	} else if (!isEmail(emailValue)) {
		setErrorFor(email, "Not a valid email.");
		isFormValid = false;
	} else {
		setSuccessFor(email);
	}

	if (passwordValue === "") {
		setErrorFor(password, "Password cannot be blank.");
		isFormValid = false;
	} else {
		setSuccessFor(password);
	}

	if (passwordConfirmValue === "") {
		setErrorFor(passwordConfirm, "Confirm password cannot be blank.");
		isFormValid = false;
	} else if (passwordValue !== passwordConfirmValue) {
		setErrorFor(
			passwordConfirm,
			"The password and confirmation password do not match."
		);
		isFormValid = false;
	} else {
		setSuccessFor(passwordConfirm);
	}

	return isFormValid;
}

function register(captcha) {
	username = document.getElementById("username_regi");
	email = document.getElementById("email_regi");
	password = document.getElementById("password_regi");
	passwordConfirm = document.getElementById("password_regi_conf");

	if (checkInputs()) {
		$("#regibutton").addClass("is-loading");
		$.getJSON(
			"https://magi.duinocoin.com/register/" +
			"?username=" +
			encodeURIComponent(username.value.trim()) +
			"&password=" +
			encodeURIComponent(password.value) +
			"&email=" +
			encodeURIComponent(email.value.trim()) +
			"&captcha=" +
			encodeURIComponent(captcha),
			function(data) {
				if (data.success == true) {
					$("html").removeClass("is-clipped");
					$("#register_modal").removeClass("is-active");
					$("#regibutton").removeClass("is-loading");
					show_modal("Wallet successfully created", "Success");
				} else {
					$("html").removeClass("is-clipped");
					$("#register_modal").removeClass("is-active");
					$("#regibutton").removeClass("is-loading");
					show_modal(data.message, "Error");
				}
			}
		);
	} else {
		return false;
	}
}

function fallbackCopyTextToClipboard(text) {
	var textArea = document.createElement("textarea");
	textArea.value = text;

	textArea.style.top = "0";
	textArea.style.left = "0";
	textArea.style.position = "fixed";

	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		console.log('Fallback: Copying text command was ' + msg);
	} catch (err) {
		console.error('Fallback: Oops, unable to copy', err);
	}

	document.body.removeChild(textArea);
}


function copy(text, element) {
	if (!navigator.clipboard) {
		fallbackCopyTextToClipboard(text);
		return;
	}
	navigator.clipboard.writeText(text).then(function() {
		console.log('Async: Copying to clipboard was successful!');
		$(element).html("<i class='fa fa-check'></i>")
	}, function(err) {
		console.error('Async: Could not copy text: ', err);
		$(element).html("<i class='fa fa-times-circle'></i>")
	});

	setTimeout(function() {
		console.log("run")
		$(element).html("<i class='fa fa-copy'></i>")
	}, 1000)
}


function fetch_privkey(element) {
	$(element).addClass("is-loading");
	$.getJSON(
		"https://magi.duinocoin.com/priv_key/?username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password),
			function(data) {
				$(element).removeClass("is-loading");
				$(element).attr("disabled", true);
				$("#priv_key_data").text(data.result);
				$("#priv_key_data").fadeIn();
			}
	).fail(function() {
		show_modal("Network error. Most likely maintenance in progress!", "Error");
	});
}

window.addEventListener("load", function() {
	(document.querySelectorAll(".notification .delete") || []).forEach(
		($delete) => {
			const $notification = $delete.parentNode;
			$delete.addEventListener("click", () => {
				$($notification).fadeOut("slow");
			});
		}
	);

	const $navbarBurgers = Array.prototype.slice.call(
		document.querySelectorAll(".navbar-burger"),
		0
	);
	$navbarBurgers.forEach((el) => {
		el.addEventListener("click", () => {
			const target = el.dataset.target;
			const $target = document.getElementById(target);
			el.classList.toggle("is-active");
			$target.classList.toggle("is-active");
		});
	});

	$("#loginbutton").click(function() {
		if ($("#usernameinput").val() && $("#passwordinput").val()) {
			$("#loginbutton").addClass("is-loading");
			username = $("#usernameinput").val();
			password = $("#passwordinput").val();
			$("html").removeClass("is-clipped");
			login(username, password);
		}
	});

	$("#privkey").click(function() {
		finalstring = `
			<p class="title has-text-danger is-size-5">
				Hold on a second!
			</p>
			<p class="subtitle is-size-6">
				That <b>private wallet key is very important</b> when it comes to Coin Magi - 
				think of it like the key to your digital vault. 
				If you don't keep your private key secure, <b>there's a real risk of losing your XMG</b>.
				<b class="has-text-danger">Anyone who gets their hands on it can steal your coins</b> and there's no way to reverse those transactions.<br><br>
				<b>Display it only if you know what you're doing. You'll be responsible of keeping it safe.</b>
			</p>

			<button class="button is-danger is-fullwidth" onclick="fetch_privkey(this)">
				I understand the danger, show me the key
			</button>

			<p class="title has-text-danger is-size-6 mt-5">
				<monospace id="priv_key_data" style="display: none">
					No private key found...
				</monospace>
			</p>

		`;
		show_modal(finalstring, "Private key <span class='tag'>BETA</span>");
	});

	$("#receive").click(function() {
		if (!address) address = "Still loading...";
		finalstring = `
			<p class="heading">
				Your XMG <b>wallet address</b>
			</p>
			<p class="title is-size-5">
				<monospace>${address}</monospace> <a onclick="copy('${address}', this)"><i class="fa fa-copy"></i></a>
			</p>
			<p class="heading">
				Your XMG <b>wallet username</b><br>(<span class="has-text-warning-dark">for other magi.duinocoin.com users</span>)
			</p>
			<p class="title is-size-5">
				<monospace>${username}</monospace> <a onclick="copy('${username}', this)"><i class="fa fa-copy"></i></a>
			</p>
		`;
		show_modal(finalstring, "Receive Magi");
	});

	$("#send").click(function() {
		finalstring = `
			<div class="columns is-multiline">
				<div class="column is-full">
					<span class="heading">Recipient (address/username)</span>
					<input class="input" id="recipient" placeholder="e.g. revox or 9RTb3ikRrWExsF6fis85g7vKqU1tQYVFuR" type="text">
				</div>
				<div class="column is-full">
					<span class="heading">Amount <small>(<span class="has-text-warning-dark">A 0.005 XMG transaction fee will apply</span>)</small></span>
					<input class="input" id="amount" placeholder="e.g. 3.1415" type="number" step="0.01" min="0.05">
				</div>
				<div class="column is-full">
				<span class="heading">Memo <small>(optional)</small></span>
					<input class="input" id="memo" placeholder="e.g. Kolka payment" type="text">
				</div>
				<div class="column is-full">
					<button class="button is-fullwidth" id="sendbutton" onclick="send_funds()">
						Confirm
					</button>
				</div>
			</div>
		`;
		show_modal(finalstring, "Send Magi");
	});

	$("#unwrap").click(function() {
		finalstring = `
			<div class="columns is-multiline">
				<div class="column is-full">
					<i class="fa fa-info-circle"></i>
					<b>Operated by <a target="_blank" href="https://wrap.magibridge.com">wrap.magibridge.com</a></b><br>
					<span>
						<details>
							<summary class="has-text-info" style="cursor:pointer">Token info</summary>
							Token address: <b><span class="monospace">0xeC159cd31964d7E64225F52757d0055f0beEA5c8</span></b><br>
							Decimals: <b>8</b><br>
							Symbol: <b>WXMG</b><br>
							Network: <b>Binance Smart Chain</b>
						</details>
					</span>
				</div>
				<div class="column is-full">
					<p class="subtitle is-size-6">
						Please send WXMG to <monospace class="has-text-info-dark">0x9683C0A527e55761d6c339b95D0FBAbE64ec7E3C</monospace> and paste the transaction hash below.
					</p>
				</div>
				<div class="column is-full">
					<span class="heading">Transaction identifier (hash)</span>
					<input class="input" id="unwraptx" placeholder="e.g. 0x3c0fd8f46c39535b06516fb87bc6b1f6871b3d6a9b0d44a315c3ddcbec850dad" type="text">
				</div>
				<div class="column is-full">
					<div class="has-text-info">
						<i class="fa fa-info-circle"></i>
						Rest of the required data will be fetched automatically for your convinience
					</div>
				</div>
				<div class="column is-full">
					<div class="has-text-danger">
						Warning! It looks like the WXMG creator disappeared and the wrapper is out of funds. Use with caution
					</div>
				</div>
				<div class="button is-fullwidth" onclick="unwrap_funds()" id="unwrapbutton">
					Unwrap
				</div>
			</div>
		`;
		show_modal(finalstring, "Unwrap WXMG to Magi");
	});

	$("#wrap").click(function() {
		finalstring = `
			<div class="columns is-multiline">
				<div class="column is-full">
					<i class="fa fa-info-circle"></i>
					<b>Operated by <a target="_blank" href="https://wrap.magibridge.com">wrap.magibridge.com</a></b><br>
					<span>
						<details>
							<summary class="has-text-info" style="cursor:pointer">Token info</summary>
							Token address: <b><span class="monospace">0xeC159cd31964d7E64225F52757d0055f0beEA5c8</span></b><br>
							Decimals: <b>8</b><br>
							Symbol: <b>WXMG</b><br>
							Network: <b>Binance Smart Chain</b>
						</details>
					</span>
				</div>
				<div class="column is-full">
					<span class="heading">BSC address</span>
					<input class="input" id="address" placeholder="e.g. 0x73557EBb936E4400ec3e7F0Cc20da82db45D9467" type="text">
				</div>
				<div class="column is-full">
					<span class="heading">Amount (<span class="has-text-warning-dark">Note: a 0.005 XMG transaction fee will apply</span>) <small>(min. 100 XMG)</small> </span>
					<input class="input" id="wrap_amount" placeholder="e.g. 2115" type="number" step="0.1" min="5">
				</div>
				<div class="column is-full">
					<div class="has-text-danger">
						Warning! It looks like the WXMG creator disappeared and the wrapper is out of funds. Use with caution
					</div>
				</div>
				<div class="column is-full">
					<button class="button is-fullwidth" id="wrapbutton" onclick="wrap_funds()">
						Wrap XMG to WXMG
					</button>
				</div>
			</div>
		`;
		show_modal(finalstring, "Wrap Magi to WXMG");
	});

	document.querySelector("#modal .delete").onclick = function() {
		$("html").removeClass("is-clipped");
		$("#modal").removeClass("is-active");
	};

	document.querySelector("#register_modal .delete").onclick = function() {
		$("html").removeClass("is-clipped");
		$("#register_modal").removeClass("is-active");
	};

	if (getcookie("password") && getcookie("username")) {
		$("#usernameinput").val(getcookie("username"));
		$("#passwordinput").val(getcookie("password"));
		$("#loginbutton").click();
	}

	$("#loader-wrapper").fadeOut('fast');
});