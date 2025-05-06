import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    Container,
    Grid,
    IconButton,
    Typography,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Chip,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    InputAdornment,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Paper,
    Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { Navbarow } from "../owner/Navbarowcomponent/navbarow/index-ow";

function Promotion() {
    const [menuItems, setMenuItems] = useState([]);
    const [menuTypes, setMenuTypes] = useState([]);
    const [formData, setFormData] = useState({
        promotionName: '',
        menuType: '',
        selectedFoodItems: [],
        discount: '',
        startDate: '',
        endDate: '',
        includeNoodleMenu: false,
    });
    const [editData, setEditData] = useState({
        promotionId: null,
        promotionName: '',
        discount: '',
        startDate: '',
        endDate: '',
        menuTypes: [],
        includeNoodleMenu: false
    });
    const [promotions, setPromotions] = useState([]);
    const [promotionDetails, setPromotionDetails] = useState({});
    const [filteredItems, setFilteredItems] = useState([]);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedPromotionId, setSelectedPromotionId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMenuItems();
        fetchPromotions();
    }, []);

    useEffect(() => {
        if (menuItems.length > 0) {
            // Extract unique menu types from menuItems
            const uniqueTypes = [...new Set(menuItems.map(item => ({
                Menu_id: item.Menu_id,
                Menu_name: item.Menu_name
            })))];

            // Remove duplicates by Menu_id
            const uniqueTypesById = uniqueTypes.filter((type, index, self) =>
                index === self.findIndex(t => t.Menu_id === type.Menu_id)
            );

            setMenuTypes(uniqueTypesById);
        }
    }, [menuItems]);

    useEffect(() => {
        if (formData.menuType && menuItems.length > 0) {
            const filtered = menuItems.filter(item => item.Menu_id === formData.menuType);
            setFilteredItems(filtered);
        } else {
            setFilteredItems([]);
        }
    }, [formData.menuType, menuItems]);

    const fetchMenuItems = async () => {
        try {
            const response = await fetch('http://localhost:3333/getmenu');
            if (response.ok) {
                const data = await response.json();
                setMenuItems(data);
            } else {
                console.error('Failed to fetch menu items');
            }
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    const fetchPromotions = async () => {
        try {
            const response = await fetch('http://localhost:3333/getpromotions');
            if (response.ok) {
                const data = await response.json();
                setPromotions(data);

                data.forEach(promotion => {
                    fetchPromotionDetails(promotion.Promotion_id);
                });
            } else {
                console.error('Failed to fetch promotions');
            }
        } catch (error) {
            console.error('Error fetching promotions:', error);
        }
    };

    const fetchPromotionDetails = async (promotionId) => {
        try {
            const response = await fetch(`http://localhost:3333/getpromotiondetails/${promotionId}`);
            if (response.ok) {
                const data = await response.json();
                setPromotionDetails(prev => ({
                    ...prev,
                    [promotionId]: data
                }));
            } else {
                console.error(`Failed to fetch details for promotion ${promotionId}`);
            }
        } catch (error) {
            console.error(`Error fetching details for promotion ${promotionId}:`, error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: checked
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3333/addpromotion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                alert('โปรโมชั่นถูกเพิ่มเรียบร้อยแล้ว');

                setFormData({
                    promotionName: '',
                    menuType: '',
                    selectedFoodItems: [],
                    discount: '',
                    startDate: '',
                    endDate: '',
                    includeNoodleMenu: false,
                });
                // Refresh promotions list
                fetchPromotions();
            } else {
                alert('เกิดข้อผิดพลาดในการเพิ่มโปรโมชั่น');
            }
        } catch (error) {
            console.error('Error adding promotion:', error);
            alert('เกิดข้อผิดพลาดในการเพิ่มโปรโมชั่น');
        }
    };
    const handleEditclick = (promotion) => {
        const Dateedit = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
        };
        const details = promotionDetails[promotion.Promotion_id]
        const menuTypeIds = details
            .filter(item => item.Menu_id)
            .map(item => item.Menu_id);
        const includesNoodleMenu = details.some(item => item.Noodlemenu === 1);
        setEditData({
            promotionId: promotion.Promotion_id,
            promotionName: promotion.Promotion_name,
            discount: promotion.Discount_value,
            startDate: Dateedit(promotion.Start_date),
            endDate: Dateedit(promotion.End_date),
            menuTypes: menuTypeIds,
            includeNoodleMenu: includesNoodleMenu
        });

        setEditDialogOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    const handleDeleteClick = (promotionId) => {
        setSelectedPromotionId(promotionId);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`http://localhost:3333/deletepromotion/${selectedPromotionId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setPromotions(promotions.filter(promo => promo.Promotion_id !== selectedPromotionId));
                alert('โปรโมชั่นถูกลบเรียบร้อยแล้ว');
            } else {
                alert('เกิดข้อผิดพลาดในการลบโปรโมชั่น');
            }
        } catch (error) {
            console.error('Error deleting promotion:', error);
            alert('เกิดข้อผิดพลาดในการลบโปรโมชั่น');
        }
        setDeleteConfirmOpen(false);
    };

    const handleEditMenuTypeChange = (e, menuId) => {
        const { checked } = e.target;
        setEditData(prevState => {
            const currentMenuTypes = [...prevState.menuTypes];

            if (checked) {
                if (!currentMenuTypes.includes(menuId)) {
                    currentMenuTypes.push(menuId);
                }
            } else {

                const index = currentMenuTypes.indexOf(menuId);
                if (index > -1) {
                    currentMenuTypes.splice(index, 1);
                }
            }

            return {
                ...prevState,
                menuTypes: currentMenuTypes
            };
        });
    };

    const handleEditSubmit = async () => {
        try {
            const response = await fetch(`http://localhost:3333/updatepromotion/${editData.promotionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    promotionName: editData.promotionName,
                    discount: editData.discount,
                    startDate: editData.startDate,
                    endDate: editData.endDate,
                    menuTypes: editData.menuTypes,
                    includeNoodleMenu: editData.includeNoodleMenu
                }),
            });

            if (response.ok) {
                // Refresh promotions list
                fetchPromotions();
                setEditDialogOpen(false);
                alert('โปรโมชั่นถูกอัพเดทเรียบร้อยแล้ว');
            } else {
                alert('เกิดข้อผิดพลาดในการอัพเดทโปรโมชั่น');
            }
        } catch (error) {
            console.error('Error updating promotion:', error);
            alert('เกิดข้อผิดพลาดในการอัพเดทโปรโมชั่น');
        }
    };


    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH');
    };

    return (
        <div>
            <Navbarow />
            <Container maxWidth="md">

                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography sx={{ textAlign: 'center', fontWeight: 'bold' }} variant="h5" gutterBottom>เพิ่มโปรโมชั่น</Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="ชื่อโปรโมชั่น"
                                name="promotionName"
                                value={formData.promotionName}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">เมนูอาหาร</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormGroup>
                                {menuTypes.map((type) => (
                                    <FormControlLabel
                                        key={type.Menu_id}
                                        control={
                                            <Checkbox
                                                checked={formData.menuType?.includes(type.Menu_id) || false}
                                                onChange={(e) => {
                                                    const newMenuType = e.target.checked
                                                        ? [...(formData.menuType || []), type.Menu_id]
                                                        : formData.menuType.filter((id) => id !== type.Menu_id);

                                                    handleChange({
                                                        target: { name: "menuType", value: newMenuType },
                                                    });
                                                }}
                                            />
                                        }
                                        label={type.Menu_name}
                                    />
                                ))}
                            </FormGroup>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.includeNoodleMenu}
                                        onChange={handleCheckboxChange}
                                        name="includeNoodleMenu"
                                    />
                                }
                                label="เมนูก๋วยเตี๋ยว"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                {filteredItems.map((item) => (
                                    <MenuItem key={item.id} value={item.id}>
                                        {item.name} - {item.price} บาท
                                    </MenuItem>
                                ))}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="ส่วนลด (บาท)"
                                name="discount"
                                value={formData.discount}
                                onChange={handleChange}
                                fullWidth
                                required
                                type="number"
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">บาท</InputAdornment>,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="วันที่เริ่มต้น"
                                name="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={handleChange}
                                fullWidth
                                required
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="วันที่สิ้นสุด"
                                name="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={handleChange}
                                fullWidth
                                required
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button type='submit' variant='contained' color='primary' fullWidth>
                                เพิ่มโปรโมชั่น
                            </Button>
                        </Grid>
                    </Grid>
                </form>

                <Box mt={4}>
                    <Typography variant="h6" gutterBottom>
                        โปรโมชั่นทั้งหมด
                    </Typography>
                    <Paper elevation={2}>
                        <List>
                            {promotions.length > 0 ? (
                                promotions.map((promotion) => (
                                    <React.Fragment key={promotion.Promotion_id}>
                                        <ListItem>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {promotion.Promotion_name}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <React.Fragment>
                                                        <Typography component="span" variant="body2" color="text.primary">
                                                            ส่วนลด: {promotion.Discount_value} บาท
                                                        </Typography>
                                                        <br />
                                                        <Typography component="span" variant="body2">
                                                            ระยะเวลา: {formatDate(promotion.Start_date)} - {formatDate(promotion.End_date)}
                                                        </Typography>
                                                        <br />
                                                        <Typography component="span" variant="body2">
                                                            เมนูที่ร่วมรายการ: {
                                                                promotionDetails[promotion.Promotion_id] ?
                                                                    promotionDetails[promotion.Promotion_id]
                                                                        .filter(item => item.Menu_name)
                                                                        .map(item => item.Menu_name)
                                                                        .join(', ') + ' , ' +
                                                                    (promotionDetails[promotion.Promotion_id].some(item => item.Noodlemenu) ? 'ก๋วยเตี๋ยว' : 'ไม่มีเมนูก๋วยเตี๋ยวที่ร่วมรายการ') :
                                                                    'กำลังโหลด...'
                                                            }
                                                        </Typography>
                                                    </React.Fragment>
                                                }
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton onClick={() => handleEditclick(promotion)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton edge="end" onClick={() => handleDeleteClick(promotion.Promotion_id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                ))
                            ) : (
                                <ListItem>
                                    <ListItemText primary="ไม่มีโปรโมชั่น" />
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                </Box>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteConfirmOpen}
                    onClose={() => setDeleteConfirmOpen(false)}
                >
                    <DialogTitle>ยืนยันการลบ</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            คุณต้องการลบโปรโมชั่นนี้ใช่หรือไม่?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteConfirmOpen(false)} color="primary">
                            ยกเลิก
                        </Button>
                        <Button onClick={handleDeleteConfirm} color="error">
                            ยืนยัน
                        </Button>
                    </DialogActions>
                </Dialog>
                {/*EDIT DIALOG*/}
                <Dialog
                    open={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    fullWidth
                    maxWidth="md"
                >
                    <DialogTitle>แก้ไขโปรโมชั่น</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12}>
                                <TextField
                                    label="ชื่อโปรโมชั่น"
                                    name="promotionName"
                                    value={editData.promotionName}
                                    onChange={handleEditChange}
                                    fullWidth
                                    required
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle1">เมนูอาหาร</Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormGroup>
                                    {menuTypes.map((type) => (
                                        <FormControlLabel
                                            key={type.Menu_id}
                                            control={
                                                <Checkbox
                                                    checked={editData.menuTypes.includes(type.Menu_id)}
                                                    onChange={(e) => handleEditMenuTypeChange(e, type.Menu_id)}
                                                />
                                            }
                                            label={type.Menu_name}
                                        />
                                    ))}
                                </FormGroup>
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={editData.includeNoodleMenu}
                                            onChange={handleEditChange}
                                            name="includeNoodleMenu"
                                        />
                                    }
                                    label="เมนูก๋วยเตี๋ยว"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="ส่วนลด (บาท)"
                                    name="discount"
                                    value={editData.discount}
                                    onChange={handleEditChange}
                                    fullWidth
                                    required
                                    type="number"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">บาท</InputAdornment>,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="วันที่เริ่มต้น"
                                    name="startDate"
                                    type="date"
                                    value={editData.startDate}
                                    onChange={handleEditChange}
                                    fullWidth
                                    required
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="วันที่สิ้นสุด"
                                    name="endDate"
                                    type="date"
                                    value={editData.endDate}
                                    onChange={handleEditChange}
                                    fullWidth
                                    required
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDialogOpen(false)} color="primary">
                            ยกเลิก
                        </Button>
                        <Button onClick={handleEditSubmit} color="primary">
                            บันทึก
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </div>
    );
}

export default Promotion;