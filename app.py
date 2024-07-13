import numpy as np
import cv2
from PIL import Image
from skimage.transform import resize
import tensorflow as tf
from flask import Flask, render_template,flash, session, redirect,url_for, session, request, send_file, jsonify
import base64
import requests,urllib
from io import BytesIO
import shutil,os
import sys
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

tf_model_segmentation = tf.keras.models.load_model('drnd22_unpatched_10epochs')
tf_model_classification = tf.keras.models.load_model('skin_disease_classifier')

classes = [
    'AKIEC: Actinic keratosis / Bowen’s disease (intraepithelial carcinoma)',
    'BCC: Basal cell carcinoma ',
    'BKL: Benign keratosis (solar lentigo / seborrheic keratosis / lichen planus-like keratosis)',
    'DF: Dermatofibroma',
    'MEL: Melanoma',
    'NV: Melanocytic nevus',
    'VASC: Vascular lesion']

def preprocessing(img_url):
  response = requests.get(img_url)
  input_image = np.asarray(Image.open(BytesIO(response.content)))
  input_image = input_image/255
  input_image = resize(input_image,(224,224))
  input_image = np.expand_dims(input_image,axis = 0)
  return input_image


def segment(img_url):
  preprocessed_img = preprocessing(img_url)
  y_pred = tf_model_segmentation.predict(preprocessed_img)
  y_pred_argmax = np.where(y_pred > 0.5, 1, 0)
  reconstructed_mask = y_pred_argmax*255
  reconstructed_mask = np.asarray(tf.squeeze(reconstructed_mask[0]))
  cv2.imwrite('predicted_masks/predicted_mask.jpg', reconstructed_mask)
  predicted_mask = cv2.imread('predicted_masks/predicted_mask.jpg',0)
  predicted_mask_resized = cv2.resize(predicted_mask, (600, 450), interpolation=cv2.INTER_AREA)
  ret, bw_mask = cv2.threshold(predicted_mask_resized, 127, 255, cv2.THRESH_BINARY)
  bw_mask = np.expand_dims(bw_mask, axis=2)
  bw_mask = cv2.cvtColor(bw_mask, cv2.COLOR_BGR2RGB)

  req = urllib.request.urlopen(img_url)
  arr = np.asarray(bytearray(req.read()))
  image = cv2.imdecode(arr,-1)
  rgb_im3 = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
  subtracted_image = rgb_im3 * (bw_mask != 0)
  # pil_subtracted_img = Image.fromarray(subtracted_image)
  return subtracted_image

def classify_image(img_url):
  preprocessed_img = preprocessing(img_url)
  predictions = tf_model_classification(preprocessed_img)
  pred_class = np.argmax(predictions, axis = 1)[0]
  return classes[pred_class]

def get_response_image(image_path):
    pil_img = Image.open(image_path, mode='r')  # reads the PIL image
    byte_arr = BytesIO()
    pil_img.save(byte_arr, format='PNG')  # convert the PIL image to byte array
    encoded_img = base64.encodebytes(byte_arr.getvalue()).decode('ascii')  # encode as base64
    return encoded_img

@app.route('/', methods=['GET'])
def index():
  return render_template('index.html')


@app.route('/predict', methods=['GET','POST'])
def predict():
  if request.method == 'POST':
    img_url = request.form['img_url']
    subtracted_img = segment(img_url)
    pil_subtracted_img = Image.fromarray(subtracted_img)
    filename = 'subtracted_img.jpg'
    pil_subtracted_img.save('static/subtracted_images/'+filename)
    img_path = 'static/subtracted_images/' + filename
    # encoded_img = get_response_image(img_path)
    # response = {
    #    'status':'Success',
    #    'ImageBytes': encoded_img
    #  }
     # return render_template('index.html', filename = filename)
    return send_file(img_path)
  return None

@app.route('/predict_class', methods = ['GET', 'POST'])
def predict_class():
  if request.method == 'POST':
    img_url = request.form['img_url']
    predicted_class = classify_image(img_url)
    return predicted_class
  return None

# @app.route('/display/<filename>')
# def display_subtracted_image(filename):
#   return redirect(url_for('static',filename= 'subtracted_images'+filename), code = 301)
    

if __name__ == '__main__':
  app.run(port=3000, debug=True)


# img_path = 'C://Users//aniro//PycharmProjects//pythonProject3//ISIC_0024306.jpg'












