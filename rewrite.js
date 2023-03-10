let data_split = [];
let paragraphs_object = [], totalToken = 0, totalKalimat = 0;
const data_instructions = [
    'tulis ulang dengan mengubah struktur kalimat di atas tanpa merubah maknanya',
    'tulis ulang dengan mengubah struktur kalimat di atas',
    // 'Tambah Data Disini ',
    // 'Tambah Data Disini 2',
    // 'Tambah Data Disini 3',
    'Tambahkan instruksi kustom'
]
const LOADING = $("#loading-overlay");
LOADING.hide();

$("#model-open-ai").val('gpt-3.5-turbo');
$.each(data_instructions, function (i, item) {
    $('#instruction-open-ai').append($('<option>', { 
        value: item,
        text : item 
    }));
});

$('#instruction-open-ai').on('change', function() {
    if (this.value === 'Tambahkan instruksi kustom') {
      const newInput = '<input class="form-control" type="text" id="instruction-open-ai" value="">';
      $('#instruction-container').html(newInput);
    }
  });

const modelOpenAiWidth = $('#model-open-ai').outerWidth();
$('#instruction-open-ai').parent().css('width', modelOpenAiWidth);

$("#btnProcessSplit").click(function () {
    let answer = window.confirm("Continue For Split this Article ? ");
    if (!answer) {
        console.log('Cancelled');
        return;
    } else {

        let article = $('#textArticle').val();
        let paragraphs = article.split(/\r?\n/);

        paragraphs_object = [];
        paragraphs.forEach((paragraph_item, paragraph_index) => {
            if (paragraph_item === '') return; 
                
            let paragraph = paragraph_item;
            let sentences = paragraph.split(/\.\s|\?\s/);

            let sentences_object = [];
            sentences.forEach((sentence_item, sentence_index) => {
                sentences_object.push({
                    "sentence_index": sentence_index,
                    "sentence_item": sentence_item,
                    "length_of_other_sentences": 0,
                    "other_sentences": [],
                    "other_sentence_ids": [],
                });
            });

            paragraphs_object.push({
                "paragraph_index": paragraph_index,
                "paragraph_item": paragraph_item,
                "length_of_sentences": sentences.length,
                "sentences_object": sentences_object,
                "sentences": sentences,
            });
            totalKalimatParagrafAkhir = sentences.length;
        });
        showDataSplit();
    }

});


$("#btnGenerateOne").click(function () {
    let resultHtml = '';
    paragraphs_object.forEach((paragraph, paragraph_index) => {
        paragraph.sentences_object.forEach((sentence, sentence_index) => {
            resultHtml += sentence.length_of_other_sentences > 0 ? '{' : '';

            resultHtml += sentence.sentence_item;

            console.log(sentence);

            if (sentence.length_of_other_sentences > 0)
                sentence.other_sentences.forEach((other_sentence_item, other_sentence_index) => {
                    resultHtml += "|" + other_sentence_item;
                });

            resultHtml += sentence.length_of_other_sentences > 0 ? '} ' : '';
        });
        resultHtml += '&#10;&#10;';
    });

    $("#textareaConvertSplitResult").html(resultHtml);
});

$("#btnGenerateTwo").click(function () {
    console.log("cliked");

    var text = $('#textareaConvertSplitResult').val();

    var matches, options, random;

    var regEx = new RegExp(/{([^{}]+?)}/);
    while ((matches = regEx.exec(text)) !== null) {
        options = matches[1].split("|");
        random = Math.floor(Math.random() * options.length);
        console.log("====== " + options);

        // var isVariable = options[random].indexOf("###");
        var isVariable = 1;

        var selectedVariable = "";
        if (isVariable >= 0) {
            // var variable = options[random].substring(0, isVariable);
            var variable = options;
            console.log("===== variable " + variable);

            // var arrayKota = $('#variable_name').val();
            var arrayKota = $('input[name=variable_name]');
            var inputs = document.getElementsByClassName('variable_name'),
                names = [].map.call(inputs, function (input) {
                    return input.value;
                }).join(',');

            console.log("===== names " + names);

            names = names.split(",");

            // console.log("===== arrayKota " + arrayKota);
            function checkVariable(name) {
                return variable == name;
            }
            console.log("===== arrayKota.findIndex(variable) " + names.findIndex(checkVariable));

            if (names.findIndex(checkVariable) >= 0) {
                selectedVariable = $("#variable_selected_" + names.findIndex(checkVariable) + " :selected").text();
                console.log("====== selectedVariable text " + selectedVariable);
            }
        }

        if (selectedVariable == "") {

            text = text.replace(matches[0], options[random]);
        } else {
            console.log("====== kudune ke replace " + selectedVariable);
            console.log("====== kudune ke replace matches[0]" + matches[0]);
            text = text.replace(matches[0], selectedVariable);
        }
    }
    $("#textareaFinalResult").val(text);
});

$('#btnAdd').click(function (e) {
    var nextTab = $('#tabs li').size()+1;
  
    // create the tab
    $('<li><a href="#tab'+nextTab+'" data-toggle="tab">Tab '+nextTab+'</a></li>').appendTo('#tabs');
    
    // create the tab content
    $('<div class="tab-pane" id="tab'+nextTab+'">tab' +nextTab+' content</div>').appendTo('.tab-content');
    
    // make the new tab active
    $('#tabs a:last').tab('show');
});

function showDataSplit() {
    paragraphs_object.forEach((paragraph, paragraph_index) => {
        let result = '';
        result += `<div class="p-2 mt-5" id="containerPerParagraph" style="width:320px; height: auto; background-color:${paragraph_index % 2 == 0 ? '#bcf4ff' : '#dbdbdb'}">
        <center><h6>Paragraph ${paragraph_index+1}</h6></center><hr>`;

        paragraph.sentences.forEach((sentence, sentence_index) => {
            let withDot = (paragraph.length_of_sentences-1) > sentence_index ? '.' : '';

            result += `<div class="section-sentence-horizontal" id="section-sentence-horizontal-${paragraph_index}-${sentence_index}">`;
            result += `<div class="mt-2 p-2 sentence-item" style="background-color:#dbdbdb">
                    <a>Kalimat ${sentence_index+1}</a>
                    <textarea class="form-control" name="paragraph[]" rows="3">${sentence}${withDot}</textarea>
                    <center>
                    <button class="btn btn-sm btn-info" onclick="AddOpenAIText('${paragraph_index}','${sentence_index}')">Add</button>
                    <button class="btn btn-sm btn-danger" onclick="DeleteHorizontalSentence('${paragraph_index}','${sentence_index}')">Delete</button>
                    </center>
                </div> `;
            result += `</div>`;

        });
        result += `</div>`;

        $('#containerSplitPerArticle').append(result);
    });
}

function showOtherSentences(paragraph_index, sentence_index) {
    const selected_sentence = paragraphs_object[paragraph_index].sentences_object[sentence_index];
    console.log(selected_sentence);

    let result = '';
    selected_sentence.other_sentences.forEach((other_sentence, other_sentence_index) => {
        result += `<div class="mt-2 p-2 sentence-item" style="background-color:#dbdbdb">
                <a>Kalimat ${sentence_index+1}</a>
                <textarea class="form-control" name="paragraph[]" rows="3">${other_sentence.trim()}</textarea> 
            </div> `;
        result += `</div>`;

    });
    result += `</div>`;

    $(`#section-sentence-horizontal-${paragraph_index}-${sentence_index}`).append(result);
}


$("#generate-input-open-ai").click(function () {
    paragraphs_object.forEach( (paragraph, paragraph_index) => {
        paragraph.sentences_object.forEach( (sentence, sentence_index) => {
            AddOpenAIText(paragraph_index, sentence_index, true);
        });
    });

});

function deleteVertialOtherSentences(other_sentence_verticaly_index) {
    paragraphs_object.forEach( (paragraph, paragraph_index) => {
        paragraph.sentences_object.forEach( (sentence, sentence_index) => {
            $(`#open-ai-div-${paragraph_index}-${sentence_index}-${other_sentence_verticaly_index}`).remove();
            DeleteTextOpenAI(paragraph_index,sentence_index, other_sentence_verticaly_index);
        });
    });
    
    $(`btn-generate-vertical-other-sentence-${other_sentence_verticaly_index}`).remove();
    $(`#btn-delete-vertical-other-sentence-${other_sentence_verticaly_index}`).remove();
} 

function generateOpenAiVertialOtherSentences(other_sentence_verticaly_index) {
    paragraphs_object.forEach( (paragraph, paragraph_index) => {
        paragraph.sentences_object.forEach( (sentence, sentence_index) => {
            GenerateOpenAI(paragraph_index,sentence_index, other_sentence_verticaly_index);
        });
    });
    
} 

function GetData()  {
    const xhr = new XMLHttpRequest;
    let urlArtikel = $("#url-artikel").val();
    xhr.open('GET', urlArtikel);

    // If specified, responseType must be empty string or "document"
    xhr.responseType = 'document';

    xhr.onload = () => {
        if (xhr.readyState === xhr.DONE && xhr.status === 200) {
            var XMLResult = xhr.responseXML;
            var test_res = XMLResult.querySelector("div.entry-content");
            var headingTags = ["h1","h2","h3","h4","h5","h6","h7","h8","h9","h10"];
            var paragraf = "", heading = "";
            var hasilQuery = test_res.getElementsByTagName("p");
            for (var i = 0; i < hasilQuery.length; i++)
            {
                var currRes = hasilQuery[i].innerText
                paragraf += currRes
                if (currRes != "" && currRes != "\0" && currRes != "\n") paragraf += "\n"
            }
            for (var i = 0; i < headingTags.length; i++)
            {
                hasilQuery = test_res.getElementsByTagName(headingTags[i]);
                for (var j = 0; j < hasilQuery.length; j++)
                    heading += (j+1) + ". " + hasilQuery[j].innerText + "\n"
            }
            $("#fetchArtikelHeadings").val(heading);
            $("#fetchArtikelContents").val(paragraf);
        }
    };

    xhr.send();
}
function GetData2()  {
    var XMLReq = new XMLHttpRequest();
  
    XMLReq.open( "GET", "https://trainingwalet-com.pages.dev/cara-mengatasi-masalah-pada-burung-walet-penyakit-dan-gangguan-umum-yang-sering-terjadi", true )
  
    XMLReq.onreadystatechange = function() {
      if(XMLReq.readyState == 4 && XMLReq.status == 200) {
        var a = XMLReq.responseXML.querySelector("div.entry-content:nth-child(1)");
        console.log(a.responseText);
      }
    }
  
    XMLReq.send();
}
  
document.querySelector("#getDataBtn").addEventListener('click', GetData);

function download(current_index) {
    var element = document.createElement('a');
    var text = document.getElementById('artikel-'+current_index).value;
    if (text != null && text && "\0" && text != "")
    {
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', 'artikel-'+(current_index+1)+'.txt');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
    else alert("Artikel spin ke-"+(current_index+1)+" belum ter-generate, mohon klik 'Generate Artikel' di atas terlebih dahulu!")
}

function AddOpenAIText(paragraph_index, sentence_index, is_mass_generate = false) {
    let current_index = paragraphs_object[paragraph_index].sentences_object[sentence_index].length_of_other_sentences;
    console.log(paragraphs_object);
    let massDeleteButton = '', massGenerateArticle = '';
    if (is_mass_generate && paragraph_index==0 && sentence_index==0) {
        massDeleteButton =`
            <button class="btn btn-sm btn-success" id="btn-generate-vertical-other-sentence-${current_index}" onclick="generateOpenAiVertialOtherSentences('${current_index}')">Generate All Open AI</button>
            <button class="btn btn-sm btn-danger" id="btn-delete-vertical-other-sentence-${current_index}" onclick="deleteVertialOtherSentences('${current_index}')">Close All</button>
            <br>
        `;
    }
    console.log("test: masuk di " + current_index + " - " + paragraph_index);

    if (is_mass_generate && sentence_index==totalKalimatParagrafAkhir-1 && paragraph_index==paragraphs_object.length-1) {
        console.log("masuk di " + current_index + " - " + paragraph_index);
        massGenerateArticle =`
            <center>
                <br>
                <button class="btn btn-md btn-warning" id="btn-generate-vertical-other-sentence-${current_index}" onclick="GenerateArticleColumn('${current_index}')">Generate Article</button>
                <br><br>
                <b>Hasil Artikel ke-${current_index+1}</b>
                <textarea class="form-control" name="artikel-${current_index}" rows="10" id="artikel-${current_index}"></textarea> 
                <button class="btn btn-md btn-primary mt-2" onclick="download(${current_index})">Download Article</button>
            </center>
        `;
    }

    paragraphs_object[paragraph_index].sentences_object[sentence_index].length_of_other_sentences = current_index+1;
    paragraphs_object[paragraph_index].sentences_object[sentence_index].other_sentences.push('');
    paragraphs_object[paragraph_index].sentences_object[sentence_index].other_sentence_ids.push(current_index);
    result = `<div class="mt-2 p-2 sentence-item" style="background-color:#dbdbdb" id="open-ai-div-${paragraph_index}-${sentence_index}-${current_index}">
        ${massDeleteButton}
        <a>Kalimat ${sentence_index+1}</a>
        <textarea class="form-control" name="paragraph[]" rows="3" id="open-ai-text-${paragraph_index}-${sentence_index}-${current_index}" onchange="updateOtherSentence('${paragraph_index}','${sentence_index}', '${current_index}')"></textarea> 
        <center>
            <button class="btn btn-sm btn-success" onclick="GenerateOpenAI('${paragraph_index}','${sentence_index}', '${current_index}')">Generate Open AI</button>
            <button class="btn btn-sm btn-danger" onclick="DeleteTextOpenAI('${paragraph_index}','${sentence_index}', '${current_index}')">Close</button>
            <div style="display: flex; justify-content: center; align-items: center;">
                <a style="margin: 0;">Total Tokens</a>
                <div style="position: relative;">
                    <textarea class="form-control ml-1" style="resize:none; overflow: hidden; width: 100px; height: 30px; padding-top: 3px;" disabled id="open-ai-tokens-${paragraph_index}-${sentence_index}-${current_index}" onchange="updateOtherSentence('${paragraph_index}','${sentence_index}', '${current_index}')"></textarea>
                </div>
            </div>
        </center>
        ${massGenerateArticle}
    </div> `;

    $(`#section-sentence-horizontal-${paragraph_index}-${sentence_index}`).append(result);
}

function DeleteHorizontalSentence(paragraph_index, sentence_index) {
    $(`#section-sentence-horizontal-${paragraph_index}-${sentence_index}`).remove();
}

function updateSentence() {}

function updateOtherSentence(paragraph_index, sentence_index, current_index) {
    let text =  $(`#open-ai-text-${paragraph_index}-${sentence_index}-${current_index}`).val();
    paragraphs_object[paragraph_index].sentences_object[sentence_index].other_sentences[current_index] = text;
}

function DeleteTextOpenAI(paragraph_index, sentence_index, current_index) {
    $(`#open-ai-div-${paragraph_index}-${sentence_index}-${current_index}`).remove();

    let index = paragraphs_object[paragraph_index].sentences_object[sentence_index].other_sentence_ids.findIndex(item => item == current_index);
    
    paragraphs_object[paragraph_index].sentences_object[sentence_index].other_sentences.splice(index, 1);
    paragraphs_object[paragraph_index].sentences_object[sentence_index].other_sentence_ids.splice(index, 1);
    paragraphs_object[paragraph_index].sentences_object[sentence_index].length_of_other_sentences = paragraphs_object[paragraph_index].sentences_object[sentence_index].other_sentences.length;
}

function GenerateArticleColumn(current_index) {
    let resultHtml = '';
    paragraphs_object.forEach((paragraph, paragraph_index) => {
        paragraph.sentences_object.forEach((sentence, sentence_index) => {
            console.log(sentence);
            resultHtml += sentence.other_sentences[current_index] + " "
        });
        resultHtml += '&#10;&#10;';
    });
    console.log(resultHtml);
    $("#artikel-"+current_index).html(resultHtml);
}

function GenerateOpenAI(paragraph_index, sentence_index, current_index) {
    let instruction = $("#instruction-open-ai").val();
    let kalimat =  paragraphs_object[paragraph_index].sentences[sentence_index];
    let keyword =  $(`#open-ai-text-${paragraph_index}-${sentence_index}-${current_index}`).val();

    let apiKey = $("#api-key").val();
    LOADING.show();
    var url = "https://api.openai.com/v1/chat/completions";

    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer "+apiKey);

    xhr.onreadystatechange = function () {
        LOADING.hide();
        if (xhr.readyState === 4) {
            console.log(xhr.status);
            console.log(xhr.response);

            let response = JSON.parse(xhr.response);
            if(response.choices.length < 1 ) {
                alert('Tidak ada hasil');
            }

            let result = response.choices[0].message.content.trim();
            if(!result.match(/\.$/)) {
                result = result + '.';
            }

            let tokens = response.usage.total_tokens;

            paragraphs_object[paragraph_index].sentences_object[sentence_index].other_sentences[current_index] = result;
            $(`#open-ai-text-${paragraph_index}-${sentence_index}-${current_index}`).val(result);

            totalToken += tokens;
            console.log("Total Token Updated to: ", totalToken);
            $(`#open-ai-tokens-${paragraph_index}-${sentence_index}-${current_index}`).val(tokens);

            const TOKEN_PRICE_USD = 0.002; // Harga API dalam USD per 1K token
            const TOKENS_PER_K = 1000; // Jumlah token per K

            // Menghitung biaya berdasarkan jumlah token yang digunakan
            function tokenToRupiah(numTokens) {
            const numK = numTokens / TOKENS_PER_K; // Konversi ke ribuan (K)
            const costUSD = numK * TOKEN_PRICE_USD; // Biaya dalam USD
            const costIDR = costUSD * 15500; // Konversi ke IDR (asumsi kurs 15500)
            return costIDR;
            }

            $("#total-tokens").text("Total token yang terpakai: " + totalToken);
            $("#total-tokens-to-rupiah").text("Harga yang dikeluarkan: Rp" + tokenToRupiah(totalToken).toFixed(2));
        }
    };

    let modelOpenAi = $("#model-open-ai").val();

    // var data = `{
    //     "model": "${modelOpenAi}",
    //     "input": "${kalimat}",
    //     "instruction": "${instruction} ${keyword}"
    // }`;

    let data = `{
        "model": "${modelOpenAi}",
        "messages": [{"role": "user", "content": "${instruction} ${kalimat}"}]
    }`;

    xhr.send(data);
}

function updateVariableList(idx) {
    var data = $('#variable_content_' + idx).val().split(/\r?\n/);

    console.log(data);

    var select = document.getElementById('variable_selected_' + idx);
    $('#variable_selected_' + idx).empty();

    for (var i = 0; i < data.length; i++) {
        var opt = document.createElement('option');
        opt.value = data[i];
        opt.innerHTML = data[i];
        select.appendChild(opt);
    }
}

var indexNewVariable = 0;
$("#addNewVariable").click(function () {
    indexNewVariable++;

    var input = `<div id="variableContentList` + indexNewVariable + `">
            <br>
            <input type="text" placeholder="Nama Variable" name="variable_name[]" class="variable_name">
            <textarea rows="5" placeholder="isine opo" id="variable_content_` + indexNewVariable + `" name="variable_content_` + indexNewVariable + `"
                onchange="updateVariableList(` + indexNewVariable + `)"></textarea>
            <br>
            <select multiple id="variable_selected_` + indexNewVariable + `"></select>
        </div>
        `;

    $("#variableContent").append(input);
});


$("#addNewVariableContent").click(function () {
    var input = `<div>
                <br>
                <input type="text" placeholder="Nama Variable" name="variable_name[]">
                <br>
                <textarea rows="4" placeholder="Isi variabel, pisah dengan enter"
                    name="content_name[]"></textarea>
            </div>`;

    $("#variableContentList").append(input);
});