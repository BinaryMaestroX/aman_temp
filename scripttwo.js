$(document).ready(function(){
    let table = new DataTable("#myTable"); // Initializing DATATABLE
    let editRecordId = null; // Variable that will store value of hiddenfield. This is used while performing updation.

    const input = document.querySelector("#phNo"); // Creating INTL-TEL-INPUT 
    const intl = window.intlTelInput(input, {
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@23.0.4/build/js/utils.js",
    });

    function getNumber() { // User Defined Function Used to extract country code and number from input of INTL-NET-INPUT control.
        var ctrCode = intl.getSelectedCountryData().dialCode;
        var phNo = intl.getNumber();
        var ph = {
            "phone_country_code": ctrCode,
            "phone_number": phNo
        };
        return ph;
    }

    function fetchData(){ //Populated Table Data
        $.ajax({
            url: 'https://glexas.com/hostel_data/API/raj/new_admission_crud.php',// API Endpoint
            type: 'GET',
            success: function (response) {
                var currentTime = new Date();
                table.clear().draw();
                $.each(response.response, function (index, item) {
                    var created_time = new Date(item.created_time);
                    var hrsDifference = (currentTime - created_time) / (1000 * 60 * 60);
                    if (hrsDifference >= 24) { // This mechanism disables edit and delete button if diffrence between created time and current time is more than 24hrs.
                        var btnHTML = '';
                    } else {
                        var btnHTML = '<button type="button" class="btn editBtn" value="' + item.registration_main_id + '"><i class="fa-solid fa-pen-to-square fa-xl"></i></button>' +
                            '<button type="button" class="btn deleteBtn" value="' + item.registration_main_id + '"><i class="fa-solid fa-trash fa-xl"></i></button>';
                    }
                    table.row.add([//Adding data row in table.
                        item.registration_main_id,
                        item.user_code,
                        item.first_name,
                        item.middle_name,
                        item.last_name,
                        item.phone_number,
                        item.phone_country_code,
                        item.email,
                        item.created_time,
                        btnHTML
                    ]).draw(false);
                });
            },
            error: function (xhr, status, error) {
                Swal.fire({//sweetAlert for Error
                    title: "Error!",
                    text: error,
                    icon: "error"
                });
            }
        });
    }

    fetchData();

    $('#getData').validate({ // Validarion Function
        rules: {
            userCode: {
                required: true
            },
            fName: {
                required: true
            },
            mName: {
                required: true
            },
            lName: {
                required: true
            },
            email: {
                required: true,
                email: true
            },
            phNo: {
                required: true,
            }
        },
        messages: {
            userCode: {
                required: "Please enter User Code."
            },
            fName: {
                required: "Please enter First Name."
            },
            mName: {
                required: "Please enter Middle Name."
            },
            lName: {
                required: "Please enter Last Name."
            },
            email: {
                required: "Please enter Email.",
                email: "Please enter a valid Email address."
            },
            phNo: {
                required: "Please enter Phone Number.",
            }
        }, 
        errorElement: 'div', // Defined that error will be parsed in form of <div> element
        errorPlacement: function (error, element) { //Define where to put error in form
            error.addClass('invalid-feedback');
            var formGroup = element.closest('.form-group');
            formGroup.find('.invalid-feedback').remove();
            formGroup.append(error);
        },
        highlight: function (element, errorClass, validClass) {//Species how error should look like
            $(element).addClass('is-invalid').removeClass('is-valid');
        },
        unhighlight: function (element, errorClass, validClass) {//Species how success should look like
            $(element).removeClass('is-invalid').addClass('is-valid');
        },
        submitHandler: function (form, event) { // Successfunction : After successful validation this function will be executed
            event.preventDefault();// Prevents default submission of form
            let  url;
            let data;
            var msg;
            var type;
            if(editRecordId == null){ // editRecordID is hidden form field. Whenever we will be updating the record. editRocordID will be holding the ID of that record. If it is null means we are inserting new data
                type = "POST" //Setting Request AS POST
                var fData = { // Creating Object
                    user_code: $('#userCode').val(),
                    first_name: $('#fName').val(),
                    middle_name: $('#mName').val(),
                    last_name: $('#lName').val(),
                    email: $('#eMail').val()
                };
                var ph = getNumber(); // Getting Phone Object which will contain country code and phone number
                data = { ...fData, ...ph }; // Merging both object and creating new object
                msg = "Data Successfully Inserted"; // Dynamic Message for SweetAlert
            }
            else{
                type = "PUT"//SETTING REQUEST AS PUT
                var fData = {//Creating Object
                    registration_main_id: editRecordId,
                    user_code: $('#userCode').val(),
                    first_name: $('#fName').val(),
                    middle_name: $('#mName').val(),
                    last_name: $('#lName').val(),
                    email: $('#eMail').val()
                };
                var ph = getNumber();
                data = JSON.stringify({ ...fData, ...ph });//Converting data in JSON as PUT request accepts JSON
                msg = "Data Successfully Updated";//Message for sweetalert
                editRecordId = null
            }
            $.ajax({ //AJAX for request
                url: "https://glexas.com/hostel_data/API/raj/new_admission_crud.php",//API Endpoint
                type: type,
                data: data,
                success: function(response){
                    Swal.fire({ // sweetAlert for Sucess with dynamic message
                        title: "Success!",
                        text: msg,
                        icon: "success"
                    });
                    fetchData();
                    
                    $("#detailModal").modal("hide"); //Hiding the modal
                },
                error: function(xhr, status, error){
                    Swal.fire({ //SweetAlert for error
                        title: "Error!",
                        text: error,
                        icon: "error"
                    });
                } 
            });
        }
    });

    $('#myTable').on("click", ".editBtn", function () { //Edit Function
        editRecordId = $(this).val();//Storing recordIn in editRecord
        $.ajax({ //Request to populate modal
            url: "https://glexas.com/hostel_data/API/raj/new_admission_crud.php",
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                $.each(response.response, function (index, item) {
                    if (editRecordId == item.registration_main_id) {
                        $("#recordId").val(item.registration_main_id);
                        $("#userCode").val(item.user_code);
                        $("#fName").val(item.first_name);
                        $("#mName").val(item.middle_name);
                        $("#lName").val(item.last_name);
                        $("#phNo").val(item.phone_number);
                        $("#eMail").val(item.email);
                        $("#detailModal").modal("show");
                    }
                });
            }
        });
    });

    $("#myTable").on("click", ".deleteBtn", function () {
        var id = $(this).val();
        Swal.fire({ // sweetalert for confirmation
            title: "Do you want to Delete this user?",
            showDenyButton: false,
            showCancelButton: true,
            confirmButtonText: "Yes",
        }).then((result) => {
            if (result.isConfirmed) { // If user confirms then this code get executed
                console.log("Conformed");
                $.ajax({
                    url: "https://glexas.com/hostel_data/API/raj/new_admission_crud.php",
                    type: "DELETE",
                    data: JSON.stringify({"registration_main_id": id }),
                    success: function (response) {
                        Swal.fire({
                            title: "Success!",
                            text: "Data Deleted Successfully",
                            icon: "success"
                        }); 
                        fetchData();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        Swal.fire({
                            title: "Error!",
                            text: errorThrown,
                            icon: "error"
                        });
                    }
                });
            } else if (result.isDenied) {
                Swal.fire("Operation Cancelled", "", "info");
                return;
            }
        });
    });

    $('#detailModal').on('hidden.bs.modal', function () {//Clearing Form and HiddenFeild whenever modal is closed.
        $('#getData')[0].reset();
        editRecordId = null;
    });
});
