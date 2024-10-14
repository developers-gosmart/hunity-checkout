const server = "https://wshunitydev.gosmartcrm.com:4000";

let countries = [];
let state = [];
let plans = [];
let relationShips = [];
let totalShow = 0;
let itemNumber = 0;
let selectedPlanId = 0; 

var stripe, elements, isCompletePaymentElement;
var lang = "es";

getAllAsync();
getAgentInfo();

async function getAgentInfo() {  
    let code_agent = getParameterByName("ca");
 
    const response = await fetch(`${server}/ws/wizard/getagentrandomcode?random_code_agent=${code_agent}`);
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    const response_1 = await response.json();
    let image =  response_1.data.image_url ? response_1.data.image_url : "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png";
    let code_cell = response_1.data.code_cell.substring(0, response_1.data.code_cell.indexOf("-"));    
 
    document.getElementById('imgAgent').setAttribute('src', image);
    document.getElementById('nameAgent').textContent = response_1.data.name_agent;
    document.getElementById('phoneAgent').textContent = `+${code_cell}${response_1.data.cell}`;
    document.getElementById('emailAgent').textContent = response_1.data.email; 
    document.getElementById('idAgent').value = response_1.data.id;
}

async function getAllAsync() {
    console.log("getAllAsync");
    try {
        state = await getState();
        relationShips = await getRelationShips();
        countries = await getCountry();

        assignDatepicker();
        eventTrigger();
        configSelect();
    } catch (error) {
        console.error("Error fetching countries:", error);
    }
}

async function getCountry() {
    const response = await fetch(server + "/ws/wizard/getcountry");
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    const response_1 = await response.json();

    return response_1.data;
}

async function getState() {
    const response = await fetch(server + "/ws/wizard/states/list");
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    const response_1 = await response.json();

    return response_1.data;
}

async function getPlans(id) {
    const response = await fetch(server + "/ws/wizard/plan/list?id_service=" + id);
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    const response_1 = await response.json();
    return response_1.data;
}

async function getRelationShips() {
    const response = await fetch(server + "/ws/wizard/getrelationship");
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    const response_1 = await response.json();
    return response_1.data;
}

async function getListPlans() {
    // Obtines el id del servicio
    let idService = getIdService();

    // console.log('serviceid',idService)
    // Obtienes los planes asociados a ese servicio
    plans = await getPlans(idService);
    // console.log("planes",plans);
    // Establece en el HTML el atributo data-id con los id_plan
    // en cada radiolevel (a nivel de bd los planes)
    setAttributeRadioLevel(plans); 
}

const assignDatepicker = () => {
    $(function () {
        var fechaMaxima = new Date();
        fechaMaxima.setFullYear(fechaMaxima.getFullYear() - 75);

        $(".datepicker").datepicker({
            maxDate: fechaMaxima,
            dateFormat: "mm-dd-yyyy",
        });
    });
}

const configSelect = () => {
    const classNameMap = {
        state_select: "strState",
        country_selet: "strCountries",
        relationShips_select: "getRelationShips",
    };

    const dataMap = {
        strState: state,
        strCountries: countries,
        getRelationShips: relationShips,
    };

    // Iterar sobre las propiedades del objeto
    for (const property in classNameMap) {
        const className = classNameMap[property];

        // Verificar si el valor es un string (asumiendo que son nombres de clase)
        if (typeof className === "string") {
            // Seleccionar los elementos con la clase
            const selects = document.querySelectorAll(`select.${className}`);

            // Obtener las opciones para la clase actual
            const opcionesParaClase = dataMap[className];

            // Hacer algo con los selects (ejemplo: agregar un evento)
            selects.forEach((select) => {
                // Agregar las opciones al select
                if (opcionesParaClase) {
                    selects.forEach((select) => {
                        agregarOpciones(select, opcionesParaClase);
                    });
                }
            });
        }
    }
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null
        ? ""
        : decodeURIComponent(results[1].replace(/\+/g, " "));
}
// Función para agregar opciones a un select
function agregarOpciones(select, opciones) {
    opciones.forEach((opcion) => {
        const optionElement = document.createElement("option");
        optionElement.value = opcion.id; // Usamos el id como valor
        optionElement.textContent = opcion.name; // Usamos el nombre completo como texto visible
        select.appendChild(optionElement);
    });
}

function eventTrigger() {
    //  DisplayHidden
    const elementsDisplayHidden = document.querySelectorAll(".display_hidden");
    elementsDisplayHidden.forEach((element) => {
        element.style.display = "none";
    });

    // Trigger radio, checkbox
    const triggerElementsRadio = document.querySelectorAll("input[type='radio'].triggerRules");
    triggerElementsRadio.forEach((element) => {
        element.addEventListener("click", function () {
            getRules(this.getAttribute("data-key"), this.value);
        });
    });

    const triggerElementsCheckbox = document.querySelectorAll("input[type='checkbox'].triggerRules");
    triggerElementsCheckbox.forEach((element) => {
        element.addEventListener("click", function () {
            getRules(this.id, this.checked == true ? this.value : "");
        });
    });

    // Trigger input, text
    const triggerElementsInput = document.querySelectorAll("input[type='input'].triggerRules, input[type='text'].triggerRules");
    triggerElementsInput.forEach((element) => {
        element.addEventListener("blur", function () {
            getRules(this.id, this.value);
        });
    });

    // Trigger button
    const triggerElementsButton = document.querySelectorAll("button.triggerRules");
    triggerElementsButton.forEach((element) => {
        element.addEventListener("click", function () {
            getRules(this.id);
        });
    });

    // Trigger select
    const triggerElementsSelect = document.querySelectorAll(".triggerRules>select");
    triggerElementsSelect.forEach((element) => {
        element.addEventListener("change", function () {
            console.log("THIS VALUE: " , this.value)
            this.value != "" ? getRules(this.id, this.value) : "";
        });
    });
}

function getRules(id, value = "") {
    let idPlan = getIdPlan(); 

    let planString = idPlan !== 0 ? `&id_plan=${idPlan}` : "";

    console.log("ID: " + id);
    console.log("value: " + value);

    console.log(`${server}/ws/wizard/getrules?key=${id}&value=${value}${planString}`);

    fetch(`${server}/ws/wizard/getrules?key=${id}&value=${value}${planString}`)
        .then((response) => response.json())
        .then((response) => {
            const rules = response.data;
            rules.forEach((rule) => {
                // console.log("rule.affected >>> ", rule); 
                const elementById = rule.affected != "" ? document.getElementById(rule.affected) : "";
                const dataRule = rule.dataRule;
                const divs = document.querySelectorAll(`.${rule.affected}`);
                switch (rule.type) {
                    case "addClass":
                        elementById.classList.add("deshabilitado");
                        break;
                    case "selectList":
                        elementById.innerHTML = "";
                        dataRule.forEach((data) => {
                            const option = new Option(data.name, data.id);
                            elementById.add(option);
                        });
                        break;
                    case "selectListBeneficiaries": 
                        elementById.innerHTML = "";
                        break;
                    case "set":
                        elementById.value = dataRule === "parent.value" ? value : dataRule;
                        break;
                    case "checked":                        
                        elementById.checked = dataRule;
                        break;
                    case "display":
                        divs.forEach((div) => { 
                            div.style.display = value == "Yes" ? "block" : "none";
                        });
                        break;
                    case "hidden":
                        divs.forEach((div) => {
                            div.style.display = value == "Yes" ? "none" : "block";
                        });
                        break;
                    case "copy":
                        const elementValue = document.getElementById(dataRule);
                        elementById.value = elementValue.value;
                        break;
                    case "clean":
                        if (elementById) {
                            if (elementById.tagName === "INPUT" || elementById.tagName === "TEXTAREA") {
                                elementById.value = "";
                            } else if (elementById.tagName === "SELECT") {
                                elementById.selectedIndex = 0; // Cambia el índice según la opción por defecto que desees
                                elementById.classList.remove("deshabilitado");
                            }
                        }
                        break;
                    case "disable":
                        if (value != "") {
                            if (value === dataRule) {
                                elementById.disabled = true;
                            }
                        } else {
                            elementById.disabled = true;
                        }
                        break;

                    case "enable":
                        if (elementById) {
                            elementById.disabled = false;
                        }
                        break;
                    case "dob":
                        elementById.value = ageCalculate(value);
                        break;
                    case "selectPayment":
                        if (dataRule == "clean") {
                            elementById.innerHTML = "";
                        } else if (value == 3) {
                            // 3: Zelle
                            var lang = "es"; //test
                            var amount = document.querySelector('input[name="payment[amountDueToday]"]').value;
                            var msg =
                                lang == "es"
                                    ? `Estimado cliente por favor envié su pago de <strong>$${amount}</strong> a la cuenta <strong>Zelle@InterLifeGroup.com.</strong> En la descripción debe incluir nombre del titular del plan.`
                                    : `Dear customer, please send your payment of $${amount} to the account Zelle@InterLifeGroup.com. In the description you must include the name of the plan holder.`;
                            var html = `<div class="alert alert-info" role="alert">
                            <h6 class="alert-heading lang" key="Instructions_one">
                              Instrucciones para pagos por ZELLE.
                            </h6>
                            <p key="" class="msg_client_zelle">${msg}</p>
                            <span class="mb-0 lang" key="Instructions_two">Luego notifique el pago con una captura por email</span>
                            <span>
                            <strong>Zelle@InterLifeGroup.com</strong> 
                              o Whatsapp 
                            <strong>+1 307 888 0109.</strong>
                            </span>
                          </div>`;
                            elementById.innerHTML = html;
                        } else if (value == 1 || value == 2) {
                            // 1: Stripe Card - 2: Stripe Bank
                            initStripe(value, rule.affected);
                        } else {
                            // 4: Other
                            elementById.innerHTML = "";
                        }
                        break;
                    case "applyFunction":
                        eval(`${dataRule}()`);
                        break; 
                    case "remove_dynamic":
                        divs.forEach((div) => {
                            if (div.hasChildNodes()) {
                                if (div.childNodes.length >= 1) { 
                                    // div.childNodes.display = "hidden"; 
                                    div.removeChild(div.firstChild);
                                }
                            }
                        });
                        break;
                    default:
                        break;
                }
            });
        })
        .catch((error) => console.error("Error al cargar el archivo JSON:", error));
}

function getIdService() {
    const radioButtons = document.querySelectorAll('input[type="radio"][name="service[typeService]"]');
    return (
        Array.from(radioButtons)
            .find((radioButton) => radioButton.checked)
            ?.getAttribute("data-id") || 0
    );
}

function getIdPlan() {      
    const radioButtons = document.querySelectorAll('input[type="radio"][name="plan[typePlan]"]'); 
    return  (
        Array.from(radioButtons)
            .find((radioButton) => radioButton.checked)
            ?.getAttribute("data-id") || 0
    );
}

function setAttributeRadioLevel(plans) {
 
    // Establece en el HTML el atributo data-id con los id_plan
    if (plans[0].name === "Individual") {
        const individual = document.getElementById("radioChoseLevel1");
        individual.setAttribute("data-id", plans[0].id);
        individual.value =  plans[0].id;
    }

    if (plans[1].name === "Couple") {
        const couple = document.getElementById("radioChoseLevel2");
        couple.setAttribute("data-id", plans[1].id);
        couple.value =  plans[1].id;
    }

    if (plans[2].name === "Family") {
        const family = document.getElementById("radioChoseLevel3");
        family.setAttribute("data-id", plans[2].id);
        family.value =  plans[2].id;        
    } 
}
 
function putServiceSummary() {
    let iconService = document.getElementById("icon-service"),
        textService = document.getElementById("text-service");
    (iconService.innerHTML = ""), (textService.innerHTML = "");
    iconService.style.backgroundColor = "#f2f2f2";

    let icono = document.createElement("i");

    let radios = document.getElementsByName("service[typeService]");

    for (let radio of radios) {
        if (radio.checked) {
            icono.className = radio.getAttribute("data-icon") + " icon-plan";
            textService.innerHTML = radio.getAttribute("data-label");
            iconService.appendChild(icono); 
       
            let radios_summary = Array.from(document.getElementsByClassName("radio-summary"));
            const dataId = radio.getAttribute("data-id");

            radios_summary.forEach((radio, index) => {
                if (dataId == 6) {
                    radio.checked = index < 2;
                    radio.style.opacity = index < 2 ? 1 : 0.5;
                } else if (dataId == 7) {
                    radio.checked = true;
                    radio.style.opacity = 1;
                } else {
                    radio.checked = false;
                    radio.style.opacity = 0.5;
                }
            });

           
        }
    }
}

function putPlanSummary() {
    let iconPlan = document.getElementById("icon-plan"),
        textPlan = document.getElementById("text-plan");
    (iconPlan.innerHTML = ""), (textPlan.innerHTML = "");
    iconPlan.style.backgroundColor = "#f2f2f2";

    let icono = document.createElement("i");
    let radios = document.getElementsByName("plan[typePlan]");
    for (let radio of radios) {
        if (radio.checked) {
            icono.className = radio.getAttribute("data-icon") + " icon-plan";
            textPlan.innerHTML = radio.getAttribute("data-label");
            iconPlan.appendChild(icono); 
        }
    }
} 

async function calculatePayment() {
    console.log("calculatePayment");

    let idService = getIdService(); 
    plans = await getPlans(idService); 
    setAttributeRadioLevel(plans);
    
    const selectedPlanId = getIdPlan();
    const idBillingPeriod = obtenerValorRadioSeleccionadojQuery("payment[billingPeriod]");
    const coupon = document.querySelector('input[name="payment[couponCode]"]').value;

    console.log("selectedPlanId ", plans); 
    console.log("idBilling ", idBillingPeriod);
    console.log("coupon ", coupon);

        fetch(`${server}/ws/wizard/getcalculate?id_plan=${selectedPlanId}&id_billing_period=${idBillingPeriod}&coupon=${coupon}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then((response) => {
            const data = response.data;
            for (const key in response.data) {
                if (response.data.hasOwnProperty(key)) {
                    const value = response.data[key];
                    const element = document.querySelector(`input[name="${key}"]`);
                    if (element) {
                        element.value = value;
                    }
                }
            }
        });

}

function obtenerValorRadioSeleccionadojQuery(nombre) {
    return $('input[name="' + nombre + '"]:checked').val();
}

let isEventBound = false;
function addDependents() {
    let itemTemplate = document.querySelector(".example-template").cloneNode(true);
    let editArea = document.querySelector(".edit-area");
    let rowArea = document.querySelector(".row-area");
    totalShow= 1;
    itemNumber= 1;
   
    if (!isEventBound) {
        document.addEventListener("click", function (event) { 
            if (event.target.matches(".edit-area .add")) {
                let item = itemTemplate.cloneNode(true);
                let inputs = item.querySelectorAll("[name]");
            
                inputs.forEach(function (input) {
                    let nameArray = input.name.split("[");
                    nameArray[1] = nameArray[1].replace("One", intToEnglish(itemNumber));
                    input.name = nameArray[0] + "[" + nameArray[1] + "[" + nameArray[2];
                });
            
                itemNumber++;
                totalShow++;
                assignDatepicker();
                rowArea.appendChild(item);
            }

            if (event.target.matches(".edit-area .rem")) {
                let lastItem = editArea.querySelector(".example-template:last-child");
                totalShow--;
                itemNumber--;
                if (lastItem) {
                    editArea.removeChild(lastItem);
                }
            }

            if (event.target.matches(".row-area .del")) {
                let row = event.target.closest(".example-template");
                if (row) {
                    totalShow--;
                    itemNumber--;
                    row.remove();
                }
            }

            document.querySelector(`input[name="dependent[totalShow]"]`).value = totalShow;
        });
        isEventBound = true;
    }
}

function limpiarTotalShow() {
    totalShow = 1;
    itemNumber = 1;
    document.querySelector(`input[name="dependent[totalShow]"]`).value = totalShow;
}

function onSubmit(token) {
    showLoading("Por favor espere..!");
    let paymentType = $("#formPaymentType").val();
    let applicant = {
        name: document.querySelector('input[name="holder[name]"]').value,
        lastName: document.querySelector('input[name="holder[lastName]"]').value,
        email: document.querySelector('input[name="holder[email]"]').value,
    }

    if (paymentType == 1) { // TARJETA DE CREDITO
        //llamar todo lo relacionado a stripe e intentar pagar
        //1- Confirm Setup
        //2- crear customer
        //3- Adjuntar metodo de pago al customer
        //4- Ejecutar el pago
        //5- Llamar a la funcion para guardar todos los campos del wizard
        if(isCompletePaymentElement){
            confirmSetupIntent(function(response){
                console.log("response")
                console.log(response)
                if (response.error) {
                    Swal.fire({
                        title: response.error.message,
                        text: 
                            lang == "es" 
                            ? "Tu tarjeta ha fallado, prueba con otra." 
                            : "Your card has failed, try another one.",
                        icon: "error"
                    });
                }else{
                    //LLamar al servicio X, enviarle todo lo necesario para 
                    //1 Crear el customer
                    //2 Adjuntarle el metodo de pago
                    //3 Intentar pagar
                    //Si paga, se guarda toda la informacion de la aplicacion, si no, no!
    
                    let dataToSend = {
                        applicant: applicant,
                        setupIntent: response,
                        amount: parseFloat(document.querySelector('input[name="payment[amountDueToday]"]').value),
                        idService: getIdService()
                    };
                    console.log("dataToSend" , dataToSend)
                    fetch(`${server}/ws/wizard/paymentStripe`, {
                        method: 'POST', // O 'PUT', dependiendo de tu API
                        headers: {
                            'Content-Type': 'application/json', // Especifica que envías JSON
                        },
                        body: JSON.stringify(dataToSend) // Convierte el objeto a JSON
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error en la red');
                        }
                        return response.json(); // Convierte la respuesta a JSON
                    })
                    .then(data => {
                        console.log('Éxito:', data); // Maneja la respuesta exitosa
                        if (data.code == 210) {
                            Swal.fire({
                                title: data.message,
                                text: lang == "es" 
                                    ? "Le sugerimos agregar otra tarjeta o intentarlo nuevamente más tarde."
                                    : "An error has occurred, we suggest adding another card or trying again later.",
                                showDenyButton: true,
                                showCancelButton: false,
                                confirmButtonText: lang == "es" 
                                    ? "Intentar luego"
                                    : "Try later",
                                denyButtonText: lang == "es" 
                                    ? "Agregar otra tarjeta"
                                    : "Add another card",
                                allowOutsideClick: false,
                                didOpen: () => {
                                    // Agregar id y class a los botones
                                    const confirmButton = Swal.getConfirmButton();
                                    const denyButton = Swal.getDenyButton();
                                    confirmButton.id = 'my-confirm-button'; // Agregar un id al botón de confirmar
                                    confirmButton.classList.add('triggerRules'); // Agregar una clase al botón de confirmar
                                    denyButton.id = 'my-deny-button'; // Agregar un id al botón de denegar
                                    denyButton.classList.add('triggerRules'); // Agregar una clase al botón de denegar
                                }
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    alert("llevar a la página de gracias.")
                                    //history.back();
                                } else if (result.isDenied) {
                                    alert("Pintar nuevamente el elemento de pago ó reiniciar la regla de seleccion de pago (evaluar).")
                                    //console.log("stripe payment 2");
                                    //$("#modal_stripe").modal("hide");
                                    //Control.getPaymentTypes();
                                }
                            });
                        }else if(data.code == 200){
                            showLoading("Pago realizado correctamente, por favor espere un poco mas..!"); 
                            saveApplication(data.idApplicant);
                        }
                    })
                    .catch((error) => {
                        console.error('Error:', error); // Maneja el error

                        Swal.fire({
                            title: "Ocurrió un error!",
                            text: "Vuelve a intentarlo mas tarde ó comunícate con el administrador del sitio.",
                            icon: "warning"
                        });
                    });
                }
            });
        }else{
            //ajustar y clocar boton "OK" al alert
            Swal.fire({
                title: "",
                text: "El numero de tarjeta es incorrecto o está incompleto",
                icon: "error"
            });
        }
    }else if (paymentType == 2){ // CUENTA BANCARIA

    }else if (paymentType == 3){ // OTHER

    }
}

function saveApplication(idApplicant) {
    // Selecciona el formulario
    const form = document.getElementById("demo-form"); 
    // Crea un objeto para almacenar los datos
    const data = $("#demo-form")
                .find(":input")
                .filter(function () {
                  return $.trim(this.value).length >= 0;
                })
                .serializeJSON(); 

    const applicant = {
        "applicant":{
            "idApplicant":3
        }
    };
    
    const newData = Object.assign({}, data, applicant);
    // Muestra el objeto JSON en la consola    
    console.log(data);
    fetch(server + "/ws/wizard/datajsondv", {
        method: 'POST', // Especificamos el método
        headers: {
            'Content-Type': 'application/json' // Indicamos que el contenido es JSON
        },
        body: JSON.stringify({dataJson: newData}) 
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la respuesta de la red');
        }
        return response.json(); // Parseamos la respuesta JSON
    })
    .then(data => {
        console.log('Éxito:', data); // Manejo de la respuesta exitosa
        Swal.fire({
            title: "Felicidades!",
            text: "El proceso se completó de manera exitosa..!",
            icon: "success"
        });
    })
    .catch((error) => {
        console.error('Error:', error); // Manejo de errores
    });
}

function intToEnglish(number) {
    var NS = [
        { value: 1000, str: "Thousand" },
        { value: 100, str: "Hundred" },
        { value: 90, str: "Ninety" },
        { value: 80, str: "Eighty" },
        { value: 70, str: "Seventy" },
        { value: 60, str: "Sixty" },
        { value: 50, str: "Fifty" },
        { value: 40, str: "Forty" },
        { value: 30, str: "Thirty" },
        { value: 20, str: "Twenty" },
        { value: 19, str: "Nineteen" },
        { value: 18, str: "Eighteen" },
        { value: 17, str: "Seventeen" },
        { value: 16, str: "Sixteen" },
        { value: 15, str: "Fifteen" },
        { value: 14, str: "Fourteen" },
        { value: 13, str: "Thirteen" },
        { value: 12, str: "Twelve" },
        { value: 11, str: "Eleven" },
        { value: 10, str: "Ten" },
        { value: 9, str: "Nine" },
        { value: 8, str: "Eight" },
        { value: 7, str: "Seven" },
        { value: 6, str: "Six" },
        { value: 5, str: "Five" },
        { value: 4, str: "Four" },
        { value: 3, str: "Three" },
        { value: 2, str: "Two" },
        { value: 1, str: "One" },
    ];

    var result = "";
    for (var n of NS) {
        if (number >= n.value) {
            if (number <= 99) {
                result += n.str;
                number -= n.value;
                if (number > 0) result += " ";
            } else {
                var t = Math.floor(number / n.value);
                // console.log(t);
                var d = number % n.value;
                if (d > 0) {
                    return intToEnglish(t) + " " + n.str + " " + intToEnglish(d);
                } else {
                    return intToEnglish(t) + " " + n.str;
                }
            }
        }
    }
    return result;
}
 
function initStripe(type, affected) {
    var paymentElement,
    clientSecret,
    lang = "es";

    let idService = getIdService();

    fetch(`${server}/ws/wizard/getsetupintentstripe?id_service=${idService}&type=${type}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((response) => {
      var data = response;
      stripe = Stripe(data.publishableKey, { locale: lang }); // clave publica stripe
      const appearance = {
        theme: "stripe",
        variables: {
          colorText: "#32325d",
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        },
      };
      clientSecret = data.setupIntent.client_secret;
      const options = {
        clientSecret: data.setupIntent.client_secret,
        appearance: appearance,
      };
      elements = stripe.elements(options);
      paymentElement = elements.create("payment");
      paymentElement.mount(`#${affected}`);

      paymentElement.addEventListener("change", (event) => {
        if (event.complete) {
          isCompletePaymentElement = true;
        } else {
          isCompletePaymentElement = false;
        }
      });
    });
}

function confirmSetupIntent(callback) {
    //Esta función se usa para confirmar el setupIntent de stripe cuando este es seleccionado como metodo de pago
    //Esta devuelve el payment_method (metodo de pago ) el cual se le adjuntará al customer(aplicante)
    //Y tambien el status (succeded ó required_action)
    stripe
    .confirmSetup({
        elements,
        redirect: "if_required",
        confirmParams: {
            // Return URL where the customer should be redirected after the SetupIntent is confirmed.
        return_url: "https://angular.gosmartcrm.com",
        },
    })
    .then(function (result) {
        if (result.error) {
            // errores por tarjeta bloqueada, numero incorrecto, rechazo del banco
            //ó error de procesamiento de stripe
            var message = result.error.message;
            callback(result);
        } else {
            console.log("confirmSetupIntent Success");
            var setupIntent = {
                payment_method: result.setupIntent.payment_method,
                status: result.setupIntent.status,
            };
            callback(setupIntent);
        }
    });
}

function showLoading(message) {
    Swal.fire({
        allowOutsideClick: false,
        html: message,
        didOpen: () => {
            Swal.showLoading();
        },
    });
}