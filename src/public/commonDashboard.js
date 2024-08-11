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
        if (tender?.userHash === App.account) {
          const tenderTemplate = `<tr style="text-align:center">
                                      <td>${tender?.id}</td>
                                      <td>${tender?.itemName}</td>
                                      <td>${tender?.itemDescription}</td>
                                      <td>${tender?.quantity}</td>
                                      <td>${tender?.coalQuality}</td>
                                      <td>${tender?.transportMode}</td>
                                      <td>${tender?.budget}</td>
                                      <td style="color: ${
                                        tender?.status === "Approved"
                                          ? "green"
                                          : tender?.status === "Accepted"
                                          ? "blue"
                                          : tender?.status === "Pending"
                                          ? "orange"
                                          : tender?.status ===
                                            "Authority Approved"
                                          ? "purple"
                                          : "brown"
                                      }; font-weight: bold;">${
            tender?.status
          }</td>
                                  </tr>`;
          $("#mytenders").append(tenderTemplate);
        }
      }
    } else {
      $("#mytenders").append(` 
      <tr style="text-align: center">
        <td colspan="8">No Requests Raised</td>
      </tr>`);
    }
  },

  listBidsOnTenders: async () => {
    const bidCount = await App.TenderAuction.bidCount();
    if (bidCount > 0) {
      for (i = 1; i <= bidCount; i++) {
        const bid = await App.TenderAuction.bids(i);
        console.log("bid-on-my-tenders", bid);
        if (bid?.tenderBy === App.account) {
          const bidTemplate = `<tr style="text-align:center">
                                              <td>${bid?.id}</td>
                                              <td>${bid?.tenderTitle}</td>
                                              <td>${bid?.tenderBudget}</td>
                                              <td>${bid?.bid}</td>
                                              <td style="color: ${
                                                bid?.status === "Approved"
                                                  ? "green"
                                                  : bid?.status === "Accepted"
                                                  ? "blue"
                                                  : bid?.status === "Pending"
                                                  ? "orange"
                                                  : bid?.status ===
                                                    "Authority Approved"
                                                  ? "purple"
                                                  : "brown"
                                              }; font-weight: bold;">${
            bid?.status
          }</td>
                                             <td>
                                              ${
                                                bid?.status === "Accepted"
                                                  ? `<button style="background: green;" onclick="App.approveBidTender(${bid?.id}, ${bid?.tenderId});">Approve</button>`
                                                  : ""
                                              }
                                              </td>
                                          </tr>`;
          $("#bids").append(bidTemplate);
        }
      }
    } else {
      $("#bids").append(` 
      <tr style="text-align: center">
        <td colspan="6">No Requests Accepted</td>
      </tr>`);
    }
  },

  submitTender: async () => {
    App.setLoading(true);
    const itemName = $("#itemName").val();
    const itemDesc = $("#itemDesc").val();
    const itemQuantity = $("#itemQuantity").val();
    const itemBudget = $("#itemBudget").val();
    const transportMode = $("#transportMode").val() || "";
    const coalQuality = $("#coalQuality").val() || "";
    const reqType = document.getElementById("usertype").innerHTML || "";

    try {
      await App.TenderAuction.createTender(
        itemName,
        itemDesc,
        itemQuantity,
        itemBudget,
        "Pending",
        reqType,
        transportMode,
        coalQuality,
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
    const currType = document.getElementById("usertype").innerHTML || "";
    let validTypes =
      currType === "Thermal Power Plant"
        ? ["Electricity Supplier"]
        : currType === "Coal Miner"
        ? ["Thermal Power Plant"]
        : currType === "Regulatory Authority"
        ? ["Coal Miner", "Transporter"]
        : currType === "Transporter"
        ? ["Coal Miner", "Transporter"]
        : [];

    if (tenderCount > 0) {
      for (i = 1; i <= tenderCount; i++) {
        const tender = await App.TenderAuction.tenders(i);
        console.log("all-tender", tender);

        if (
          tender?.userHash !== App.account &&
          validTypes.includes(tender?.tenderType) &&
          !(
            currType === "Regulatory Authority" && tender?.status === "Approved"
          )
        ) {
          const tenderTemplate = `<tr style="text-align:center">
                                            <td>${tender?.id}</td>
                                            <td>${tender?.itemName}</td>
                                            <td>${tender?.itemDescription}</td>
                                            <td>${tender?.quantity}</td>
                                            <td>${tender?.coalQuality}</td>
                                            <td>${tender?.transportMode}</td>
                                            <td>${tender?.budget}</td>
                                            <td style="color: ${
                                              tender?.status === "Approved"
                                                ? "green"
                                                : tender?.status === "Accepted"
                                                ? "blue"
                                                : tender?.status === "Pending"
                                                ? "orange"
                                                : tender?.status ===
                                                  "Authority Approved"
                                                ? "purple"
                                                : "brown"
                                            }; font-weight: bold; width:250px;">${
            tender?.status
          }</td>
          ${
            currType === "Transporter"
              ? tender?.tenderType === "Transporter"
                ? ` <td><input class="form-control" type="text" style="margin-bottom:10px; width: 150px;" id="updatedstatus${tender?.id}" placeholder="Enter new place">
              <input class="form-control" type="text" style="margin-bottom:10px; width: 150px;" id="updatedname${tender?.id}" placeholder="Enter your name"></td>`
                : "<td></td>"
              : ""
          }
                                            <td>
                                            ${
                                              tender?.status === "Pending"
                                                ? currType ===
                                                  "Regulatory Authority"
                                                  ? `<button style="background: green;" onclick="App.approveTender(${tender?.id});">Approve</button>`
                                                  : `<button onclick="popup('${tender?.id}')">Accept</button>`
                                                : ""
                                            }
                                            ${
                                              currType === "Transporter" &&
                                              tender?.tenderType ===
                                                "Transporter"
                                                ? `<button onclick="App.updateTransportStatus(${tender?.id}, '${tender?.status}');">Update</button>`
                                                : ""
                                            }
                                            </td>
                                        <tr>`;

          const tenderPopupTemplate = `<div class="abc" id="tenderId${
            tender[0]
          }">
                                                <br><br><br>
                                                <div style="margin-top:15%; width: 550px; position: relative; gap: 5px;" class="dashboard-container">
                                                <span onclick="div_hide('${
                                                  tender?.id
                                                }')" style="float:right" class="x">X</span>
                                                    
                                                    <span style="margin-top:10px;"><b>Request Title: </b>${
                                                      tender?.itemName
                                                    }</span>
                                                    <span style="margin-top:10px;"><b>Request Description: </b>${
                                                      tender?.itemDescription
                                                    }</span>
                                                    <span style="margin-top:10px;"><b>Quantity: </b>${
                                                      tender?.quantity
                                                    }</span>
                                                    <span style="margin-top:10px;"><b>Coal Quality: </b>${
                                                      tender?.coalQuality
                                                    }</span>
                                                    <span style="margin-top:10px;"><b>Transport Mode: </b>${
                                                      tender?.transportMode
                                                    }</span>
                                                    <span style="margin-top:10px;"><b>Payment Alloted: </b>${
                                                      tender?.budget
                                                    }</span>
                                                    <span style="margin-top:10px;"><b>Status: </b>
                                                     
                                    
                                                    <span style="color: ${
                                                      tender?.status ===
                                                      "Approved"
                                                        ? "green"
                                                        : tender?.status ===
                                                          "Accepted"
                                                        ? "blue"
                                                        : tender?.status ===
                                                          "Pending"
                                                        ? "orange"
                                                        : tender?.status ===
                                                          "Authority Approved"
                                                        ? "purple"
                                                        : "brown"
                                                    }; font-weight: bold;">${
            tender?.status
          }</span>
          </span>
  
                                                    <hr>
                                                    <center style="margin-bottom:10px;">
                                                        <input class="form-control" type="number" style="margin-bottom:10px;" id="ppi${
                                                          tender?.id
                                                        }" placeholder="Enter your Amount">
                                                        <button class="w3-button w3-green" style="width:150px;" onclick="App.makeBid(${
                                                          tender?.id
                                                        });">Accept Request</button>
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
        <td colspan="5">No Requests Accepted</td>
      </tr>`);
    }
  },

  listMyBids: async () => {
    const bidCount = await App.TenderAuction.bidCount();
    if (bidCount > 0) {
      for (i = 1; i <= bidCount; i++) {
        const bid = await App.TenderAuction.bids(i);
        console.log("my-bid", bid);
        if (bid?.userHash === App.account) {
          const bidTemplate = `<tr style="text-align:center">
                                                <td>${bid?.id}</td>
                                                <td>${bid?.tenderTitle}</td>
                                                <td>${bid?.tenderBudget}</td>
                                                <td>${bid?.bid}</td>
                                                <td style="color: ${
                                                  bid?.status === "Approved"
                                                    ? "green"
                                                    : bid?.status === "Accepted"
                                                    ? "blue"
                                                    : bid?.status === "Pending"
                                                    ? "orange"
                                                    : bid?.status ===
                                                      "Authority Approved"
                                                    ? "purple"
                                                    : "brown"
                                                }; font-weight: bold;">${
            bid?.status
          }</td>
                                            </tr>`;
          $("#myBids").append(bidTemplate);
        }
      }
    } else {
      $("#myBids").append(`
      <tr style="text-align: center">
        <td colspan="5">No Requests Accepted By You</td>
      </tr>`);
    }
  },

  makeBid: async (id) => {
    App.setLoading(true);
    try {
      const bid = $("#ppi" + id).val();
      await App.TenderAuction.createBid(id, "Accepted", bid, {
        from: App.account,
      });
      window.location.reload();
      showMyBids();
    } catch {
      window.location.reload();
      showMyBids();
    }
  },

  updateTransportStatus: async (tenderId, tenderStatus) => {
    App.setLoading(true);
    let newStatus = tenderStatus + " --> ";
    const enteredStatus = $("#updatedstatus" + tenderId).val();
    const enteredName = $("#updatedname" + tenderId).val();
    const appendString = enteredStatus + " ( " + enteredName + " ) ";
    newStatus += appendString;

    try {
      await App.TenderAuction.updateTender(tenderId, newStatus, {
        from: App.account,
      });
      window.location.reload();
      showAllTenders();
    } catch {
      window.location.reload();
      showAllTenders();
    }
  },

  approveTender: async (tenderId) => {
    App.setLoading(true);
    const currType = document.getElementById("usertype").innerHTML || "";
    let newStatus = "Approved";
    if (currType === "Regulatory Authority") newStatus = "Authority Approved";

    try {
      await App.TenderAuction.updateTender(tenderId, newStatus, {
        from: App.account,
      });
      window.location.reload();
      showAllTenders();
    } catch {
      window.location.reload();
      showAllTenders();
    }
  },

  approveBidTender: async (id, tenderId) => {
    App.setLoading(true);
    const currType = document.getElementById("usertype").innerHTML || "";
    let newStatus = "Approved";
    if (currType === "Regulatory Authority") newStatus = "Authority Approved";

    try {
      await App.TenderAuction.updateTenderBid(id, tenderId, newStatus, {
        from: App.account,
      });
      window.location.reload();
      showMyBids();
    } catch {
      window.location.reload();
      showMyBids();
    }
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
