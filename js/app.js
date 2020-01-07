const contractSource = `
contract Hireme = 
 record detail = 
  { finderAddress : address,
    url		  : string,
    nameOfJob	  : string,
    voteCount	  : int }
   
 record state = 
  { details : map(int, detail),
    detailsNum : int}
 
 entrypoint init() = 
  { details = {},
    detailsNum = 0 }

 entrypoint getJob(index : int) : detail = 
  switch(Map.lookup(index, state.details))
   None  => abort("There is no Job with that ID.")
   Some(x) => x  

 stateful entrypoint addJob(url' : string, nameOfJob' : string) = 
  let detail = { finderAddress  = Call.caller, url = url', nameOfJob = nameOfJob', voteCount = 0}
  let index = getdetailsNum() + 1
  put(state {details[index] = detail, detailsNum = index})
 
 entrypoint getdetailsNum() : int = 
  state.detailsNum
 payable stateful entrypoint voteJob(index : int) =
  let detail = getJob(index)
  Chain.spend(detail.finderAddress, Call.value)
  let updatedvoteCount = detail.voteCount + Call.value
  let updatedDetails = state.details{ [index].voteCount = updatedvoteCount }
  put(state{ details = updatedDetails })
`;
const contractAddress ='ct_fAh4JwmrTtPkcQnt9ydVmCcnuqwtmmjwUR6YDgsGgJatRRUP4';
var client = null;
var memeArray = [];
var memesLength = 0;
var memeArray = [];


function renderMemes() {
    memeArray = memeArray.sort(function(a,b){return b.votes-a.votes})
    var template = $('#template').html();
    Mustache.parse(template);
    var rendered = Mustache.render(template, {memeArray});
    $('#memeBody').html(rendered);
  }
  
  window.addEventListener('load', async () => {
    $("#loader").show();
  
    client = await Ae.Aepp();
  
    const contract = await client.getContractInstance(contractSource, {contractAddress});
    const calledGet = await contract.call('getdetailsNum', [], {callStatic: true}).catch(e => console.error(e));
    console.log('calledGet', calledGet);
  
    const decodedGet = await calledGet.decode().catch(e => console.error(e));
    console.log('decodedGet', decodedGet);
  
    renderMemes();
  
    $("#loader").hide();
  });
  
  jQuery("#memeBody").on("click", ".voteBtn", async function(event){
    const value = $(this).siblings('input').val();
    const dataIndex = event.target.id;
    const foundIndex = memeArray.findIndex(meme => meme.index == dataIndex);
    memeArray[foundIndex].votes += parseInt(value, 10);
    renderMemes();
  });
  
  $('#registerBtn').click(async function(){
    var name = ($('#regName').val()),
        url = ($('#regUrl').val());
  
    memeArray.push({
      creatorName: name,
      memeUrl: url,
      index: memeArray.length+1,
      votes: 0
    })
  
    renderMemes();
  });
