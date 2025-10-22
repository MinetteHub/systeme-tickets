const Ticket = require('../models/Ticket');

// ═══════════════════════════════════════════════════════════════
// 📝 CREATE - Créer un ticket
// ═══════════════════════════════════════════════════════════════

// @desc    Créer un nouveau ticket
// @route   POST /api/tickets
// @access  Private (token requis)
exports.createTicket = async (req, res) => {
    try {
        // 1. Extraire les données du body
        const { title, description, priority, category } = req.body;
        
        // 2. Créer le ticket
        // req.user.id vient du middleware protect
        const ticket = await Ticket.create({
            title,
            description,
            priority,
            category,
            createdBy: req.user.id  // Utilisateur connecté
        });
        
        // 3. Renvoyer le ticket créé
        res.status(201).json({
            success: true,
            ticket
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ═══════════════════════════════════════════════════════════════
// 📋 READ - Lire les tickets
// ═══════════════════════════════════════════════════════════════

// @desc    Récupérer tous les tickets
// @route   GET /api/tickets
// @access  Private
exports.getTickets = async (req, res) => {
    try {
        // Options de filtrage (query params)
        const { status, priority, category } = req.query;
        
        // Construire le filtre
        let filter = {};
        
        // Si l'utilisateur est consultant, voir seulement ses tickets
        if (req.user.role === 'consultant') {
            filter.createdBy = req.user.id;
        }
        // Si manager ou dev, voir tous les tickets
        
        // Ajouter les filtres optionnels
        if (status) filter.status = status;
        if (priority) filter.priority = priority;
        if (category) filter.category = category;
        
        // Récupérer les tickets
        const tickets = await Ticket.find(filter)
            .populate('createdBy', 'name email role')  // Infos du créateur
            .populate('assignedTo', 'name email role')  // Infos de l'assigné
            .sort('-createdAt');  // Plus récents en premier
        
        res.json({
            success: true,
            count: tickets.length,
            tickets
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Récupérer un ticket par ID
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('createdBy', 'name email role')
            .populate('assignedTo', 'name email role');
        
        // Vérifier si le ticket existe
        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: 'Ticket non trouvé'
            });
        }
        
        // Vérifier les permissions
        // Consultant : voir seulement ses propres tickets
        if (req.user.role === 'consultant' && 
            ticket.createdBy._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Non autorisé à voir ce ticket'
            });
        }
        
        res.json({
            success: true,
            ticket
        });
        
    } catch (error) {
        // Erreur si l'ID n'est pas un ObjectId valide
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                error: 'Ticket non trouvé'
            });
        }
        
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ═══════════════════════════════════════════════════════════════
// ✏️ UPDATE - Modifier un ticket
// ═══════════════════════════════════════════════════════════════

// @desc    Mettre à jour un ticket
// @route   PUT /api/tickets/:id
// @access  Private
exports.updateTicket = async (req, res) => {
    try {
        let ticket = await Ticket.findById(req.params.id);
        
        // Vérifier si le ticket existe
        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: 'Ticket non trouvé'
            });
        }
        
        // Vérifier les permissions
        // Consultant : modifier seulement ses propres tickets
        if (req.user.role === 'consultant' && 
            ticket.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'Non autorisé à modifier ce ticket'
            });
        }
        
        // Manager/Dev : peuvent tout modifier
        // Consultant : peuvent modifier seulement title, description
        let allowedFields = ['title', 'description', 'status', 'priority', 'category'];
        
        if (req.user.role === 'consultant') {
            allowedFields = ['title', 'description'];
        }
        
        // Construire l'objet de mise à jour
        const updateData = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });
        
        // Mettre à jour le ticket
        ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,  // Retourner le document mis à jour
                runValidators: true  // Exécuter les validations du schema
            }
        ).populate('createdBy', 'name email role')
         .populate('assignedTo', 'name email role');
        
        res.json({
            success: true,
            ticket
        });
        
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                error: 'Ticket non trouvé'
            });
        }
        
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// @desc    Assigner un ticket à un utilisateur
// @route   PUT /api/tickets/:id/assign
// @access  Private (Manager only)
exports.assignTicket = async (req, res) => {
    try {
        const { assignedTo } = req.body;
        
        // Vérifier que assignedTo est fourni
        if (!assignedTo) {
            return res.status(400).json({
                success: false,
                error: 'L\'ID de l\'utilisateur est requis'
            });
        }
        
        // Trouver et mettre à jour le ticket
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { assignedTo },
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email role')
         .populate('assignedTo', 'name email role');
        
        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: 'Ticket non trouvé'
            });
        }
        
        res.json({
            success: true,
            ticket
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ═══════════════════════════════════════════════════════════════
// 🗑️ DELETE - Supprimer un ticket
// ═══════════════════════════════════════════════════════════════

// @desc    Supprimer un ticket
// @route   DELETE /api/tickets/:id
// @access  Private (Manager only)
exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        
        if (!ticket) {
            return res.status(404).json({
                success: false,
                error: 'Ticket non trouvé'
            });
        }
        
        // Supprimer le ticket
        await ticket.deleteOne();
        
        res.json({
            success: true,
            message: 'Ticket supprimé',
            ticketId: req.params.id
        });
        
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                error: 'Ticket non trouvé'
            });
        }
        
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ═══════════════════════════════════════════════════════════════
// 📊 STATISTIQUES (Bonus)
// ═══════════════════════════════════════════════════════════════

// @desc    Obtenir les statistiques des tickets
// @route   GET /api/tickets/stats
// @access  Private
exports.getStats = async (req, res) => {
    try {
        // Compter les tickets par statut
        const stats = await Ticket.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Formater les résultats
        const formattedStats = {
            open: 0,
            in_progress: 0,
            resolved: 0,
            closed: 0
        };
        
        stats.forEach(stat => {
            formattedStats[stat._id] = stat.count;
        });
        
        res.json({
            success: true,
            stats: formattedStats
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ═══════════════════════════════════════════════════════════════
// 💡 EXPLICATIONS
// ═══════════════════════════════════════════════════════════════

/*
1. POPULATE :
   .populate('createdBy', 'name email role')
   - Remplace l'ObjectId par l'objet User complet
   - Ne récupère que les champs spécifiés (name, email, role)
   - Sans populate : createdBy = "507f1f77bcf86cd799439011"
   - Avec populate : createdBy = { _id: "...", name: "Marie", email: "..." }

2. PERMISSIONS :
   - Consultant : Voit et modifie seulement ses tickets
   - Manager/Dev : Voient et modifient tous les tickets
   - Seul Manager peut supprimer

3. FILTRES (Query params) :
   GET /api/tickets?status=open&priority=high
   - req.query = { status: 'open', priority: 'high' }
   - Permet de filtrer les résultats

4. findByIdAndUpdate OPTIONS :
   - new: true → Retourne le document APRÈS modification
   - runValidators: true → Vérifie les validations du schema

5. GESTION D'ERREURS :
   - 404 : Ressource non trouvée
   - 403 : Non autorisé (mauvaises permissions)
   - 500 : Erreur serveur

6. req.user :
   - Ajouté par le middleware protect
   - Contient : { id, email, role }
   - Utilisé pour vérifier les permissions
*/