import React, { useState, useEffect } from 'react';
import {
  TextField,
  MenuItem,
  Button,
  Container,
  Grid,
  IconButton,
  Box,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, Link } from 'react-router-dom';

function MenuForm() {
  const [formData, setFormData] = useState({
    price: '',
    soupId: '',
    sizeId: '',
    meatId: '',
    noodleTypeId: '',
    image: null,
    selectAllSoup: false,
    selectAllSize: false,
    selectAllMeat: false,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [soups, setSoups] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [meats, setMeats] = useState([]);
  const [noodleTypes, setNoodleTypes] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [soupRes, sizeRes, meatRes, noodleTypeRes] = await Promise.all([
          fetch('https://lanchangbackend-production.up.railway.app/soups'),
          fetch('https://lanchangbackend-production.up.railway.app/sizes'),
          fetch('https://lanchangbackend-production.up.railway.app/meats'),
          fetch('https://lanchangbackend-production.up.railway.app/noodletypes')
        ]);

        const soupData = await soupRes.json();
        const sizeData = await sizeRes.json();
        const meatData = await meatRes.json();
        const noodleTypeData = await noodleTypeRes.json();

        setSoups(soupData);
        setSizes(sizeData);
        setMeats(meatData);
        setNoodleTypes(noodleTypeData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name.startsWith('selectAll')) {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, image: file }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const generateMenuCombinations = () => {
    const selectedSoups = formData.selectAllSoup ? soups : soups.filter(s => s.Soup_id === formData.soupId);
    const selectedSizes = formData.selectAllSize ? sizes : sizes.filter(s => s.Size_id === formData.sizeId);
    const selectedMeats = formData.selectAllMeat ? meats : meats.filter(m => m.Meat_id === formData.meatId);
    const noodleType = formData.selectAllnoodle ? noodleTypes : noodleTypes.filter(n => n.Noodle_type_id === formData.noodleTypeId);

    const combinations = [];
    for (const noodle of noodleType) {
      for (const soup of selectedSoups) {
        for (const size of selectedSizes) {
          for (const meat of selectedMeats) {
            combinations.push({
              Noodle_menu_price: formData.price,
              Soup_id: soup.Soup_id,
              Size_id: size.Size_id,
              Meat_id: meat.Meat_id,
              Noodle_type_id: noodle.Noodle_type_id,
              Noodle_menu_picture: formData.image
            });
          }
        }
      }
    }

    return combinations;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.price) {
      alert('กรุณาเลือกชนิดเส้นและระบุราคา');
      return;
    }

    const menuCombinations = generateMenuCombinations();
    let successCount = 0;
    let failureCount = 0;

    for (const menu of menuCombinations) {
      const formDataToSend = new FormData();
      Object.keys(menu).forEach(key => {
        formDataToSend.append(key, menu[key]);
      });

      try {
        const response = await fetch('https://lanchangbackend-production.up.railway.app/addnoodlemenu', {
          method: 'POST',
          body: formDataToSend
        });

        const data = await response.json();
        if (response.ok && data.status === 'ok') {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        console.error('Error:', error);
        failureCount++;
      }
    }

    alert(`เพิ่มเมนูสำเร็จ ${successCount} รายการ, ไม่สำเร็จ ${failureCount} รายการ`);
    if (successCount > 0) {
      navigate('/menupage');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 1 }}>
        <IconButton onClick={() => navigate(-1)} aria-label="back">
          <ArrowBackIcon />
        </IconButton>
        <Link to="/addex" style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="primary">
            เพิ่มรายการส่วนประกอบก๋วยเตี๋ยว
          </Button>
        </Link>
      </Box>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh'}}>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '600px' }}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
              <Card variant="outlined">
                <Grid item xs={12} sm={12}>
                  <TextField
                    label="ราคา"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    fullWidth
                    required
                    type="number"
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.selectAllnoodle}
                        onChange={handleChange}
                        name="selectAllnoodle"
                      />
                    }
                    label="เลือกเส้นทั้งหมด"
                  />
                  {!formData.selectAllnoodle && (
                    <TextField
                      select
                      label="ชนิดเส้น"
                      name="noodleTypeId"
                      value={formData.noodleTypeId}
                      onChange={handleChange}
                      fullWidth
                      required
                    >
                      {noodleTypes.map((type) => (
                        <MenuItem key={type.Noodle_type} value={type.Noodle_type_id}>
                          {type.Noodle_type_name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}

                </Grid>

                <Grid item xs={12} sm={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.selectAllSoup}
                        onChange={handleChange}
                        name="selectAllSoup"
                      />
                    }
                    label="เลือกซุปทั้งหมด"
                  />
                  {!formData.selectAllSoup && (
                    <TextField
                      select
                      label="ประเภทซุป"
                      name="soupId"
                      value={formData.soupId}
                      onChange={handleChange}
                      fullWidth
                      required={!formData.selectAllSoup}
                    >
                      {soups.map((soup) => (
                        <MenuItem key={soup.Soup_id} value={soup.Soup_id}>
                          {soup.Soup_name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Grid>

                <Grid item xs={12} sm={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.selectAllSize}
                        onChange={handleChange}
                        name="selectAllSize"
                      />
                    }
                    label="เลือกไซส์ทั้งหมด"
                  />
                  {!formData.selectAllSize && (
                    <TextField
                      select
                      label="ไซส์"
                      name="sizeId"
                      value={formData.sizeId}
                      onChange={handleChange}
                      fullWidth
                      required={!formData.selectAllSize}
                    >
                      {sizes.map((size) => (
                        <MenuItem key={size.Size_id} value={size.Size_id}>
                          {size.Size_name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Grid>

                <Grid item xs={12} sm={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.selectAllMeat}
                        onChange={handleChange}
                        name="selectAllMeat"
                      />
                    }
                    label="เลือกเนื้อทั้งหมด"
                  />
                  {!formData.selectAllMeat && (
                    <TextField
                      select
                      label="ชนิดเนื้อ"
                      name="meatId"
                      value={formData.meatId}
                      onChange={handleChange}
                      fullWidth
                      required={!formData.selectAllMeat}
                    >
                      {meats.map((meat) => (
                        <MenuItem key={meat.Meat_id} value={meat.Meat_id}>
                          {meat.Meat_name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Grid>
              </Card>
            

          {/*
          <Grid item xs={12}>
              <input
                accept="image/*"
                type="file"
                id="image-upload"
                onChange={handleImageChange}
                hidden
              />
              <label htmlFor="image-upload">
                <Button variant="contained" component="span">
                  อัปโหลดรูปภาพ
                </Button>
              </label>
              {previewImage && (
                <Box mt={2}>
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                  />
                </Box>
              )}
            </Grid>
          */ }
            
        

            <Grid item xs={12}>
              <Box mt={2}>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  เพิ่มก๋วยเตี๋ยว
                </Button>
              </Box>
            </Grid>

          </Grid>
        </Grid>

      </form>
      </div>
      
    </Container>
  );
}

export default MenuForm;