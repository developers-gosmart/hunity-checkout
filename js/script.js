
const server = "https://wshunitydev.gosmartcrm.com:4000";

var countries = [];
var state = [];
var plans=[];




function onSubmit(token) {
    document.getElementById("demo-form").submit();
}
getAllAsync();


// Función para agregar opciones a un select
function agregarOpciones(select, opciones) {
  
  opciones.forEach(opcion => {
    const optionElement = document.createElement('option');
    optionElement.value = opcion.id; // Usamos el id como valor
    optionElement.textContent = opcion.name; // Usamos el nombre completo como texto visible
    select.appendChild(optionElement);
  });
}

const configSelect = () => {


      const classNameMap = {
          state_select: 'strState',
          country_selet: 'strCountries'
      };

      const dataMap = {
        strState: state,
        strCountries: countries
      };
  
      // Iterar sobre las propiedades del objeto
      for (const property in classNameMap) {

        const className = classNameMap[property];
              
        // Verificar si el valor es un string (asumiendo que son nombres de clase)
        if (typeof className === 'string') {
          // Seleccionar los elementos con la clase
          const selects = document.querySelectorAll(`select.${className}`);
          // Obtener las opciones para la clase actual
          const opcionesParaClase = dataMap[className];
          // Hacer algo con los selects (ejemplo: agregar un evento)
          selects.forEach(select => {
                // Agregar las opciones al select
                if (opcionesParaClase) {
                  selects.forEach(select => {
                    agregarOpciones(select, opcionesParaClase);
                  });
                }
          });
        }
      }



}

async function getAllAsync() {

  console.log("getAllAsync");

  try {
   
    state = await getState();
       
    
    assignDatepicker();
    eventTrigger();
    configSelect();
     
  } catch (error) {
    console.error("Error fetching countries:", error);
  }
}

const assignDatepicker = () => {
  $(function () {

    var fechaMaxima = new Date();
    fechaMaxima.setFullYear(fechaMaxima.getFullYear() - 75);


    $(".  ").datepicker({
        maxDate: fechaMaxima,
        dateFormat: "mm-dd-yyyy"
    }); 
  });
};

function eventTrigger() {
  //  DisplayHidden
  const elementsDisplayHidden = document.querySelectorAll(".display_hidden");
  elementsDisplayHidden.forEach((element) => {
    element.style.display = "none";
  });

  // Trigger radio, checkbox
  const triggerElementsRadio = document.querySelectorAll(
    "input[type='radio'].triggerRules"
  );
  triggerElementsRadio.forEach((element) => {
    element.addEventListener("click", function () {
      getRules(this.getAttribute("data-key"), this.value);
    });
  });

  const triggerElementsCheckbox = document.querySelectorAll(
    "input[type='checkbox'].triggerRules"
  );
  triggerElementsCheckbox.forEach((element) => {
    element.addEventListener("click", function () {
      getRules(this.id, this.checked == true ? "checked" : "unchecked");
    });
  });

  // Trigger input, text
  const triggerElementsInput = document.querySelectorAll(
    "input[type='input'].triggerRules, input[type='text'].triggerRules"
  );
  triggerElementsInput.forEach((element) => {
    element.addEventListener("blur", function () {
      getRules(this.id, this.value);
    });
  });

  // Trigger button
  const triggerElementsButton = document.querySelectorAll(
    "button.triggerRules"
  );
  triggerElementsButton.forEach((element) => {
    element.addEventListener("click", function () {
      getRules(this.id);
    });
  });

  // Trigger select
  const triggerElementsSelect = document.querySelectorAll(
    ".triggerRules>select"
  );
  triggerElementsSelect.forEach((element) => {
    element.addEventListener("change", function () {
      this.value != "" ? getRules(this.id, this.value) : "";
    });
  });

  
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
  const response = await fetch(server + "/ws/wizard/plan/list?id_service="+id);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const response_1 = await response.json();
  return response_1.data;
}




function getRules(id, value = "") {
  let idPlan = getIdPlan();

  console.log("ID: " + id);
  console.log("value: " + value);

  let planString = idPlan !== 0 ? `&id_plan=${idPlan}` : "";

  console.log('${server}/ws/wizard/getrules?key=${id}&value=${value}${planString}');

  console.log('key', id);
  console.log('value', value);
  console.log('plan',planString);
  



  fetch(`${server}/ws/wizard/getrules?key=${id}&value=${value}${planString}`)
    .then((response) => response.json())
    .then((response) => {
      const rules = response.data;
      rules.forEach((rule) => {
        console.log("rule.affected >>> ", rule);
        const elementById =
          rule.affected != "" ? document.getElementById(rule.affected) : "";
        const dataRule = rule.dataRule;
        switch (rule.type) {
          case "selectList":
            elementById.innerHTML = "";
            dataRule.forEach((data) => {
              const option = new Option(data.name, data.id);
              elementById.add(option);
            });
          break;
          case "selectListBeneficiaries":
            // TODO aca devuelve el units_max de plan_price lo que significa el maximo de beneficiario de plan
            elementById.innerHTML = "";
          break;
          case "set":
            elementById.value = dataRule === "parent.value" ? value : dataRule;
          break;
          case "display":
            const divs = document.querySelectorAll(`.${rule.affected}`);
            divs.forEach((div) => {
              div.style.display = value == "Yes" ? "block" : "none";
            });
          break;
          case "copy":
            const elementValue = document.getElementById(dataRule);
            elementById.value = elementValue.value;
          break;
          case "clean":
            if (elementById.tagName === 'INPUT' || elementById.tagName === 'TEXTAREA') {
                elementById.value = '';
            } else if (elementById.tagName === 'SELECT') {
                elementById.selectedIndex = 0; // Cambia el índice según la opción por defecto que desees
            }
          break;
          case "disable":
            if (value != "") {
              if (value === dataRule) {
                  elementById.disabled = true;
              }
            }else{
              elementById.disabled = true;
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
          default:
          break;
        }
      });
    })
    .catch((error) => console.error("Error al cargar el archivo JSON:", error));
}





function getIdService() {
  const radioButtons = document.querySelectorAll(
    'input[type="radio"][name="service[typeService]"]'
  );
  return (
    Array.from(radioButtons)
      .find((radioButton) => radioButton.checked)
      ?.getAttribute("data-id") || 0
  );
}



function getIdPlan() {
  const radioButtons = document.querySelectorAll(
    'input[type="radio"][name="plan[typePlan]"]'
  );
  return (
    Array.from(radioButtons)
      .find((radioButton) => radioButton.checked)
      ?.getAttribute("data-id") || 0
  );
}

async function getListPlans(){
  console.log("hola  getplan");
  // Obtines el id del servicio
  let idService = getIdService();

  console.log('serviceid',idService)
  // Obtienes los planes asociados a ese servicio
  plans = await getPlans(idService);
  console.log("planes",plans);
  // Establece en el HTML el atributo data-id con los id_plan
  // en cada radiolevel (a nivel de bd los planes)
  setAttributeRadioLevel(plans);

 




}

function setAttributeRadioLevel(plans){
     // Establece en el HTML el atributo data-id con los id_plan
      if(plans[0].name ==='Individual'){   
      const individual = document.getElementById('radioChoseLevel1');
      individual.setAttribute('data-id', plans[0].id);
  
      }

      if(plans[1].name==='Couple'){
        const couple = document.getElementById('radioChoseLevel2');
        couple.setAttribute('data-id', plans[1].id);
      }


      if(plans[2].name==='Family'){
          const family = document.getElementById('radioChoseLevel3');
          family.setAttribute('data-id', plans[2].id);
      }
}


