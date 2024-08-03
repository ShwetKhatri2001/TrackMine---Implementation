App = {
  loading: false,

  render: async () => {
    if (App.loading) {
      return;
    }
    $("#account").html(App.account);
    await App.listMyTenders();
    await App.listBidsOnTenders();
    await App.listAllTenders();
    await App.listMyBids();
  },

  listMyTenders: async () => {
    const tenderCount = await App.TenderAuction.tenderCount();
    if (tenderCount > 0) {
      for (i = 1; i <= tenderCount; i++) {
        const tender = await App.TenderAuction.tenders(i);
        // console.log("my-tender", tender);
        if (tender[5] === App.account) {
          const tenderTemplate = `<tr style="text-align:center">
                                              <td>${tender[0]}</td>
                                              <td>${tender[1]}</td>
                                              <td>${tender[2]}</td>
                                              <td>${tender[3]}</td>
                                              <td>${tender[4]}</td>
                                              <td style="color: orange; font-weight: bold;">Pending</td>
                                          </tr>`;
          $("#mytenders").append(tenderTemplate);
        }
      }
    } else {
      $("#mytenders").append(` 
      <tr style="text-align: center">
        <td colspan="4">No Requests Raised</td>
      </tr>`);
    }
  },

  listBidsOnTenders: async () => {
    const bidCount = await App.TenderAuction.bidCount();
    if (bidCount > 0) {
      for (i = 1; i <= bidCount; i++) {
        const bid = await App.TenderAuction.bids(i);
        console.log("bid-on-tender", bid);
        if (bid?.tenderBy === App.account) {
          const bidTemplate = `<tr style="text-align:center">
                                              <td>${bid[0]}</td>
                                              <td>${bid[3]}</td>
                                              <td>${bid[4]}</td>
                                              <td>
                                          </tr>`;
          $("#bids").append(bidTemplate);
        }
      }
    } else {
      $("#bids").append(` 
      <tr style="text-align: center">
        <td colspan="4">No Requests Accepted</td>
      </tr>`);
    }
  },

  submitTender: async () => {
    App.setLoading(true);
    const itemName = $("#itemName").val();
    const itemDesc = $("#itemDesc").val();
    const itemQuantity = $("#itemQuantity").val();
    const itemBudget = $("#itemBudget").val();

    try {
      await App.TenderAuction.createTender(
        itemName,
        itemDesc,
        itemQuantity,
        itemBudget,
        {
          from: App.account,
        }
      );
      window.location.reload();
    } catch {
      window.location.reload();
    }
  },

  listAllTenders: async () => {
    const tenderCount = await App.TenderAuction.tenderCount();
    if (tenderCount > 0) {
      for (i = 1; i <= tenderCount; i++) {
        const tender = await App.TenderAuction.tenders(i);
        // console.log("all-tender", tender);
        if (tender[5] !== App.account) {
          const tenderTemplate = `<tr style="text-align:center">
                                            <td>${tender[0]}</td>
                                            <td>${tender[1]}</td>
                                            <td>${tender[2]}</td>
                                            <td>${tender[3]}</td>
                                            <td>${tender[4]}</td>
                                            <td style="color: orange; font-weight: bold;">Pending</td>
                                            <td><button onclick="popup('${tender[0]}')" class="btn btn-success">Accept</button></td>
                                        <tr>`;

          const tenderPopupTemplate = `<div class="abc" id="tenderId${tender[0]}">
                                                <br><br><br>
                                                <div style="margin-top:15%; width: 550px; position: relative;" class="dashboard-container">
                                                <span onclick="div_hide('${tender[0]}')" style="float:right" class="x">X</span>
                                                    
                                                    <span style="margin-top:10px;"><b>Request ID: </b>${tender[0]}</span>
                                                    <span style="margin-top:10px;"><b>Request Name: </b>${tender[1]}</span>
                                                    <span style="margin-top:10px;"><b>Request Description: </b>${tender[2]}</span>
                                                    <span style="margin-top:10px;"><b>Quantity: </b>${tender[3]}</span>
                                                    <span style="margin-top:10px;"><b>Payment Alloted: </b>${tender[4]}</span>
    
                                                    <hr>
    
                                                    <center style="margin-bottom:10px;">
                                                        <input class="form-control" type="number" style="margin-bottom:10px;" id="ppi${tender[0]}" placeholder="Enter your Amount">
                                                        <button class="w3-button w3-green" style="width:150px;" onclick="App.makeBid(${tender[0]});">Accept Request</button>
                                                    </center>
    
                                                </div>
                                                
                                            </div>`;

          $("#allTenders").append(tenderTemplate);
          $("#tenderPopup").append(tenderPopupTemplate);
        }
      }
    } else {
      $("allTenders").append(`
      <tr style="text-align: center">
        <td colspan="4">No Requests Accepted</td>
      </tr>`);
    }
  },

  listMyBids: async () => {
    const bidCount = await App.TenderAuction.bidCount();
    if (bidCount > 0) {
      for (i = 1; i <= bidCount; i++) {
        const bid = await App.TenderAuction.bids(i);
        console.log("my-bid", bid);
        if (bid[5] == App.account) {
          const bidTemplate = `<tr style="text-align:center">
                                                <td>${bid[0]}</td>
                                                <td>${bid[3]}</td>
                                                <td>${bid[4]}</td>
                                                <td style="color: blue; font-weight: bold">Accepted</td>
                                            </tr>`;
          $("#myBids").append(bidTemplate);
        }
      }
    } else {
      $("#myBids").append(`
      <tr style="text-align: center">
        <td colspan="4">No Requests Accepted By You</td>
      </tr>`);
    }
  },

  makeBid: async (id) => {
    App.setLoading(true);
    const bid = $("#ppi" + id).val();
    App.TenderAuction.createBid(id, bid, { from: App.account });
  },

  setLoading: (boolean) => {
    App.loading = boolean;
    const loader = $("#loading");
    const content = $("#content");
    if (boolean) {
      loader.show();
      content.hide();
    } else {
      loader.hide();
      content.show();
    }
  },
};

function uploadTenders() {
  $("#myTendersList").hide();
  $("#myBidsList").hide();
  $("#bidsList").hide();
  $("#listAllTenders").hide();
  $("#uploadTender").show();
}

function showMyTenders() {
  $("#uploadTender").hide();
  $("#myBidsList").hide();
  $("#bidsList").hide();
  $("#listAllTenders").hide();
  $("#myTendersList").show();
}

function showAllBids() {
  $("#uploadTender").hide();
  $("#myBidsList").hide();
  $("#myTendersList").hide();
  $("#listAllTenders").hide();
  $("#bidsList").show();
}

function showAllTenders() {
  $("#uploadTender").hide();
  $("#myBidsList").hide();
  $("#myTendersList").hide();
  $("#bidsList").hide();
  $("#listAllTenders").show();
}

function showMyBids() {
  $("#uploadTender").hide();
  $("#listAllTenders").hide();
  $("#myTendersList").hide();
  $("#bidsList").hide();
  $("#myBidsList").show();
}

function popup(id) {
  $("#tenderId" + id).show();
}

function div_hide(id) {
  $("#tenderId" + id).hide();
}
