
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


    $(".datepicker").datepicker({
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
      getRules(this.id, this.checked == true ? this.value : "");
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

  // console.log("ID: " + id);
  // console.log("value: " + value);

  let planString = idPlan !== 0 ? `&id_plan=${idPlan}` : "";

  console.log(`${server}/ws/wizard/getrules?key=${id}&value=${value}${planString}`);

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
          case "hidden":
            const divs_h = document.querySelectorAll(`.${rule.affected}`);           
            divs_h.forEach((div) => {
              console.log(div);
              div.style.display = value == "Yes" ? "none" : "block";
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

  // console.log('serviceid',idService)
  // Obtienes los planes asociados a ese servicio
  plans = await getPlans(idService);
  // console.log("planes",plans);
  // Establece en el HTML el atributo data-id con los id_plan
  // en cada radiolevel (a nivel de bd los planes)
  setAttributeRadioLevel(plans);
  putServiceSummary(idService)
}


function putServiceSummary(service){ 
 
  let iconService = document.getElementById('icon-service'), textService = document.getElementById('text-service'); 
   iconService.innerHTML = '',textService.innerHTML = '' ; 
   iconService.style.backgroundColor = '#f2f2f2';
 
  let icono = document.createElement("i");
   if(service == '6'){   
     icono.className = "fas fa-tooth p-2"; 
     textService.innerHTML = 'Dental & Vision'; 
     iconService.appendChild(icono);
   }
 
   if(service == '7'){   
     icono.className = "fas fa-dog p-2"; 
     textService.innerHTML = 'Total Health';
     iconService.appendChild(icono);
   }
 
 
   if(service == '8'){   
     icono.className = "fas fa-heartbeat p-2"; 
     textService.innerHTML = 'PetVet';
     iconService.appendChild(icono);
   }
  
 }

function setAttributeRadioLevel(plans){
    let planName = '';
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
          addDependents()
      }
      console.log(plans);
      // putPlanSummary(planName)
}


function putPlanSummary(plan){ 
 
  let iconPlan = document.getElementById('icon-plan'), textPlan = document.getElementById('text-plan'); 
   iconPlan.innerHTML = '',textPlan.innerHTML = '' ; 
   iconPlan.style.backgroundColor = '#f2f2f2';
 console.log(plan);
  let iconoDos = document.createElement("i");
   if(plan == 'Individual'){   
     iconoDos.className = "fas fa-user p-2"; 
     textPlan.innerHTML = plan; 
     iconPlan.appendChild(iconoDos);
   }
 
   if(plan == 'Couple'){   
     iconoDos.className = "fas fa-user-friends p-2"; 
     textPlan.innerHTML = plan;
     iconPlan.appendChild(iconoDos);
   }
 
 
   if(plan == 'Family'){   
     iconoDos.className = "fas fa-users p-2"; 
     textPlan.innerHTML = plan;
     iconPlan.appendChild(iconoDos);
   }
  
}

function addDependents(){
  var itemTemplate = document.querySelector('.example-template').cloneNode(true);
  var editArea = document.querySelector('.edit-area');
  var rowArea = document.querySelector('.row-area');
  var itemNumber = 2;

  document.addEventListener('click', function(event) {
      if (event.target.matches('.edit-area .add')) {
          var item = itemTemplate.cloneNode(true);
          var inputs = item.querySelectorAll('[name]');
        
          inputs.forEach(function(input) {
            var nameArray = input.name.split("[")
            nameArray[1] = nameArray[1].replace("One", intToEnglish(itemNumber))           
            input.name = nameArray[0] + '[' + nameArray[1] + '[' + nameArray[2];
           
          });
          
          itemNumber++; 
          console.log(item);
          rowArea.appendChild(item);
      }

      if (event.target.matches('.edit-area .rem')) {
          var lastItem = editArea.querySelector('.example-template:last-child');
          if (lastItem) {
              editArea.removeChild(lastItem);
          }
      }

      if (event.target.matches('.row-area .del')) {
          var row = event.target.closest('.example-template');
          if (row) {
              row.remove();
          }
      }
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
    { value: 1, str: "One" }
  ];

  var result = '';
  for (var n of NS) {
    if (number >= n.value) {
      if (number <= 99) {
        result += n.str;
        number -= n.value;
        if (number > 0) result += ' ';
      } else {
        var t = Math.floor(number / n.value);
        // console.log(t);
        var d = number % n.value;
        if (d > 0) {
          return intToEnglish(t) + ' ' + n.str + ' ' + intToEnglish(d);
        } else {
          return intToEnglish(t) + ' ' + n.str;
        }

      }
    }
  }
  return result;
}




