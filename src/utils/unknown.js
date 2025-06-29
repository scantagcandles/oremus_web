jQuery(document).ready(function($) {
 var mediaRecorder;
 var audioChunks = [];
 var videoChunks = [];
 var stream;
 var timerInterval;
 var recordingTime = 0;
 var currentCartKey = '';
 var currentProductId = '';
 var currentRecordingKey = '';
 var isAudioRecording = true;

 $(document).on('click', '.wc-record-button', function() {
  currentCartKey = $(this).data('cart-key');
  currentProductId = $(this).data('product-id');
  currentRecordingKey = $(this).data('recording-key');

  $('#wc-current-product-id').val(currentProductId);
  $('#wc-current-cart-key').val(currentCartKey);
  $('#wc-current-recording-key').val(currentRecordingKey);

  $.ajax({
  url: wc_recording_params.ajax_url,
  type: 'POST',
  data: {
   action: 'get_product_recording',
   security: wc_recording_params.recording_nonce,
   cart_key: currentCartKey
  },
  success: function(response) {
   if (response.success && response.data.recording_id) {
    $('#wc-recording-alert').text('Ten produkt ma już nagranie. Nowe nagranie zastąpi poprzednie.').show();
   } else {
    $('#wc-recording-alert').text(wc_recording_params.warning_text).show();
   }
  }
  });

  $('#wc-recording-modal').show();
  $('#wc-recording-modal-overlay').show();
 });

 $('.wc-recording-close, #wc-recording-modal-overlay').click(function() {
  stopRecording();
  $('#wc-recording-modal').hide();
  $('#wc-recording-modal-overlay').hide();
  resetRecordingUI();
 });

 function startRecording() {
 if (isAudioRecording) {
 navigator.mediaDevices.getUserMedia({ audio: true })
 .then(function(stream